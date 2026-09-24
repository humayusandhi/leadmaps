<?php

declare(strict_types=1);

namespace App\Domain\Lead\Actions;

use App\Domain\Business\Models\Business;
use App\Domain\Lead\Enums\LeadStatusEnum;
use App\Domain\Lead\Models\Lead;
use App\Domain\Workspace\Models\Workspace;
use DomainException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class SaveBusinessAsLeadAction
{
    /**
     * Convert a discovered Business into a saved Lead within the active workspace.
     * Idempotent: Returns the existing lead if already saved in this workspace.
     * Enforces the 1 credit per lead rule.
     */
    public function execute(string $workspaceId, string $businessId, ?string $assignedUserId = null): Lead
    {
        $business = Business::find($businessId);
        if (! $business) {
            throw new InvalidArgumentException("Business with ID [{$businessId}] does not exist.");
        }

        $existing = Lead::withoutGlobalScopes()
            ->where('workspace_id', $workspaceId)
            ->where('business_id', $businessId)
            ->first();

        if ($existing) {
            return $existing->load(['business', 'tags', 'notes']);
        }

        $workspace = Workspace::find($workspaceId);
        if (! $workspace) {
            throw new InvalidArgumentException("Workspace with ID [{$workspaceId}] does not exist.");
        }

        if ($workspace->credit_balance < 1) {
            throw new DomainException("Insufficient workspace credits. 1 credit is required per saved lead.");
        }

        return DB::transaction(function () use ($workspace, $workspaceId, $businessId, $assignedUserId) {
            // Deduct 1 credit per saved lead
            $workspace->decrement('credit_balance', 1);

            $lead = Lead::create([
                'workspace_id' => $workspaceId,
                'business_id' => $businessId,
                'status' => LeadStatusEnum::NEW,
                'assigned_to_user_id' => $assignedUserId,
            ]);

            return $lead->load(['business', 'tags', 'notes']);
        });
    }
}
