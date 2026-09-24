<?php

declare(strict_types=1);

namespace App\Domain\Lead\Actions;

use App\Domain\Lead\Enums\LeadStatusEnum;
use App\Domain\Lead\Models\Lead;

class UpdateLeadStatusAction
{
    /**
     * Update the lifecycle status of a lead, enforcing strict state machine transitions.
     *
     * @param Lead $lead
     * @param LeadStatusEnum|string $newStatus
     * @return Lead
     * @throws \DomainException on illegal status transition
     */
    public function execute(Lead $lead, LeadStatusEnum|string $newStatus): Lead
    {
        $target = $newStatus instanceof LeadStatusEnum
            ? $newStatus
            : LeadStatusEnum::from($newStatus);

        /** @var LeadStatusEnum $current */
        $current = $lead->status;

        $current->assertCanTransitionTo($target);

        $lead->update([
            'status' => $target,
        ]);

        return $lead->refresh();
    }
}
