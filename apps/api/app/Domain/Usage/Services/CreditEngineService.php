<?php

declare(strict_types=1);

namespace App\Domain\Usage\Services;

use App\Domain\Usage\Exceptions\InsufficientCreditsException;
use App\Domain\Usage\Models\CreditBalance;
use App\Domain\Usage\Models\CreditReservation;
use App\Domain\Usage\Models\CreditTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class CreditEngineService
{
    /**
     * Phase 1: Atomically reserve credits using row-level locking.
     *
     * @param string $workspaceId
     * @param int $amount
     * @param string|null $jobId
     * @return CreditReservation
     * @throws InsufficientCreditsException
     */
    public function reserve(string $workspaceId, int $amount, ?string $jobId = null): CreditReservation
    {
        if ($amount <= 0) {
            throw new RuntimeException("Reservation amount must be positive. Received: {$amount}");
        }

        return DB::transaction(function () use ($workspaceId, $amount, $jobId) {
            /** @var CreditBalance $balance */
            $balance = CreditBalance::where('workspace_id', $workspaceId)
                ->lockForUpdate()
                ->first();

            if (! $balance) {
                // Initialize balance row if non-existent
                $balance = CreditBalance::create([
                    'id' => (string) Str::uuid(),
                    'workspace_id' => $workspaceId,
                    'balance' => 0,
                    'reserved' => 0,
                    'lifetime_granted' => 0,
                    'lifetime_consumed' => 0,
                ]);
            }

            $available = max(0, $balance->balance - $balance->reserved);
            if ($available < $amount) {
                throw new InsufficientCreditsException($amount, $available);
            }

            $balance->reserved += $amount;
            $balance->save();

            return CreditReservation::create([
                'id' => (string) Str::uuid(),
                'workspace_id' => $workspaceId,
                'job_id' => $jobId,
                'amount' => $amount,
                'status' => 'RESERVED',
                'expires_at' => now()->addHours(2),
            ]);
        });
    }

    /**
     * Phase 2a: Commit the reservation, burning the credits and updating the append-only ledger.
     *
     * @param string $reservationId
     * @param int|null $actualAmount
     * @return CreditTransaction
     */
    public function commit(string $reservationId, ?int $actualAmount = null): CreditTransaction
    {
        return DB::transaction(function () use ($reservationId, $actualAmount) {
            /** @var CreditReservation $reservation */
            $reservation = CreditReservation::where('id', $reservationId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($reservation->status !== 'RESERVED') {
                throw new RuntimeException("Cannot commit reservation in status: {$reservation->status}");
            }

            $burnAmount = $actualAmount ?? $reservation->amount;
            if ($burnAmount < 0) {
                throw new RuntimeException("Burn amount cannot be negative: {$burnAmount}");
            }

            /** @var CreditBalance $balance */
            $balance = CreditBalance::where('workspace_id', $reservation->workspace_id)
                ->lockForUpdate()
                ->firstOrFail();

            // Release the hold and burn the actual balance
            $balance->reserved = max(0, $balance->reserved - $reservation->amount);
            $balance->balance = max(0, $balance->balance - $burnAmount);
            $balance->lifetime_consumed += $burnAmount;
            $balance->save();

            $reservation->status = 'COMMITTED';
            $reservation->save();

            return CreditTransaction::create([
                'id' => (string) Str::uuid(),
                'workspace_id' => $reservation->workspace_id,
                'amount' => -$burnAmount,
                'type' => 'CONSUMPTION',
                'description' => "Usage consumed for reservation [{$reservation->id}]",
                'reference_id' => $reservation->job_id ?? $reservation->id,
                'balance_after' => $balance->balance,
            ]);
        });
    }

    /**
     * Phase 2b: Release the hold without penalty (e.g. if the job failed or was aborted).
     *
     * @param string $reservationId
     * @param string $reason
     */
    public function release(string $reservationId, string $reason = 'Job aborted or failed'): void
    {
        DB::transaction(function () use ($reservationId, $reason) {
            /** @var CreditReservation $reservation */
            $reservation = CreditReservation::where('id', $reservationId)
                ->lockForUpdate()
                ->first();

            if (! $reservation || $reservation->status !== 'RESERVED') {
                return;
            }

            /** @var CreditBalance $balance */
            $balance = CreditBalance::where('workspace_id', $reservation->workspace_id)
                ->lockForUpdate()
                ->first();

            if ($balance) {
                $balance->reserved = max(0, $balance->reserved - $reservation->amount);
                $balance->save();
            }

            $reservation->status = 'RELEASED';
            $reservation->save();

            CreditTransaction::create([
                'id' => (string) Str::uuid(),
                'workspace_id' => $reservation->workspace_id,
                'amount' => 0,
                'type' => 'REFUND',
                'description' => "Reservation released: {$reason}",
                'reference_id' => $reservation->id,
                'balance_after' => $balance ? $balance->balance : 0,
            ]);
        });
    }

    /**
     * Atomically grant credits to a workspace (e.g. monthly quota or top-up purchase).
     *
     * @param string $workspaceId
     * @param int $amount
     * @param string $type
     * @param string $description
     * @param string|null $referenceId
     * @return CreditTransaction
     */
    public function grant(
        string $workspaceId,
        int $amount,
        string $type = 'MONTHLY_GRANT',
        string $description = 'Monthly credit renewal',
        ?string $referenceId = null
    ): CreditTransaction {
        if ($amount <= 0) {
            throw new RuntimeException("Grant amount must be positive. Received: {$amount}");
        }

        return DB::transaction(function () use ($workspaceId, $amount, $type, $description, $referenceId) {
            /** @var CreditBalance $balance */
            $balance = CreditBalance::where('workspace_id', $workspaceId)
                ->lockForUpdate()
                ->first();

            if (! $balance) {
                $balance = CreditBalance::create([
                    'id' => (string) Str::uuid(),
                    'workspace_id' => $workspaceId,
                    'balance' => 0,
                    'reserved' => 0,
                    'lifetime_granted' => 0,
                    'lifetime_consumed' => 0,
                ]);
            }

            $balance->balance += $amount;
            $balance->lifetime_granted += $amount;
            $balance->save();

            return CreditTransaction::create([
                'id' => (string) Str::uuid(),
                'workspace_id' => $workspaceId,
                'amount' => $amount,
                'type' => $type,
                'description' => $description,
                'reference_id' => $referenceId,
                'balance_after' => $balance->balance,
            ]);
        });
    }

    /**
     * Get real-time credit balance summary for a workspace.
     *
     * @param string $workspaceId
     * @return array{balance: int, reserved: int, available: int, lifetime_granted: int, lifetime_consumed: int}
     */
    public function getBalanceSummary(string $workspaceId): array
    {
        $balance = CreditBalance::where('workspace_id', $workspaceId)->first();

        if (! $balance) {
            return [
                'balance' => 0,
                'reserved' => 0,
                'available' => 0,
                'lifetime_granted' => 0,
                'lifetime_consumed' => 0,
            ];
        }

        return [
            'balance' => $balance->balance,
            'reserved' => $balance->reserved,
            'available' => max(0, $balance->balance - $balance->reserved),
            'lifetime_granted' => $balance->lifetime_granted,
            'lifetime_consumed' => $balance->lifetime_consumed,
        ];
    }
}
