<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\Billing\Models\Plan;
use App\Domain\Billing\Models\Subscription;
use App\Domain\Usage\Services\CreditEngineService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessSubscriptionWebhookJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    /**
     * @param array<string, mixed> $payload
     */
    public function __construct(
        public readonly array $payload
    ) {
        $this->onQueue('billing');
    }

    public function handle(CreditEngineService $creditEngine): void
    {
        $event = $this->payload['event'] ?? '';
        $subPayload = $this->payload['payload']['subscription']['entity'] ?? null;
        $paymentPayload = $this->payload['payload']['payment']['entity'] ?? null;

        Log::info("ProcessSubscriptionWebhookJob processing event: [{$event}]");

        if (! $subPayload) {
            Log::warning("ProcessSubscriptionWebhookJob: No subscription entity in webhook payload.");
            return;
        }

        $subId = $subPayload['id'] ?? '';
        $planId = $subPayload['plan_id'] ?? '';

        $subscription = Subscription::with('plan')
            ->where('provider_subscription_id', $subId)
            ->first();

        if (! $subscription) {
            Log::warning("Subscription not found for ID: {$subId}");
            return;
        }

        try {
            switch ($event) {
                case 'subscription.activated':
                case 'subscription.charged':
                    $plan = $subscription->plan;
                    $creditsToGrant = $plan ? $plan->monthly_credits : 500;

                    // Atomically grant monthly credits to workspace
                    $creditEngine->grant(
                        workspaceId: $subscription->workspace_id,
                        amount: $creditsToGrant,
                        type: 'MONTHLY_GRANT',
                        description: "Monthly subscription credits ({$plan?->name})",
                        referenceId: $paymentPayload['id'] ?? $subId
                    );

                    $subscription->update([
                        'status' => 'active',
                        'current_period_start' => now(),
                        'current_period_end' => now()->addDays(30),
                    ]);
                    break;

                case 'subscription.halted':
                    $subscription->update(['status' => 'past_due']);
                    break;

                case 'subscription.cancelled':
                    $subscription->update([
                        'status' => 'cancelled',
                        'cancelled_at' => now(),
                    ]);
                    break;

                default:
                    Log::info("Unhandled billing webhook event: {$event}");
                    break;
            }
        } catch (Exception $e) {
            Log::error("Error processing subscription webhook: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }
}
