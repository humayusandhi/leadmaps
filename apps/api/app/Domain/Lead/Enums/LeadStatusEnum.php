<?php

declare(strict_types=1);

namespace App\Domain\Lead\Enums;

use DomainException;

enum LeadStatusEnum: string
{
    case NEW = 'NEW';
    case RESEARCHED = 'RESEARCHED';
    case CONTACTED = 'CONTACTED';
    case REPLIED = 'REPLIED';
    case QUALIFIED = 'QUALIFIED';
    case MEETING = 'MEETING';
    case WON = 'WON';
    case LOST = 'LOST';

    /**
     * Determine if a transition from current status to target status is valid.
     */
    public function canTransitionTo(self $target): bool
    {
        if ($this === $target) {
            return true;
        }

        return match ($this) {
            self::NEW => in_array($target, [self::RESEARCHED, self::CONTACTED, self::LOST], true),
            self::RESEARCHED => in_array($target, [self::CONTACTED, self::LOST], true),
            self::CONTACTED => in_array($target, [self::REPLIED, self::LOST], true),
            self::REPLIED => in_array($target, [self::QUALIFIED, self::LOST], true),
            self::QUALIFIED => in_array($target, [self::MEETING, self::WON, self::LOST], true),
            self::MEETING => in_array($target, [self::WON, self::LOST], true),
            self::LOST => in_array($target, [self::NEW, self::CONTACTED], true),
            self::WON => false, // Terminal success state
        };
    }

    /**
     * Assert that a transition is allowed; throws DomainException otherwise.
     */
    public function assertCanTransitionTo(self $target): void
    {
        if (! $this->canTransitionTo($target)) {
            throw new DomainException(
                "Illegal lead status transition from '{$this->value}' to '{$target->value}'."
            );
        }
    }

    public function label(): string
    {
        return match ($this) {
            self::NEW => 'New Prospect',
            self::RESEARCHED => 'Researched',
            self::CONTACTED => 'Contacted',
            self::REPLIED => 'Replied',
            self::QUALIFIED => 'Qualified Opportunity',
            self::MEETING => 'Meeting Booked',
            self::WON => 'Deal Won',
            self::LOST => 'Lost / Disqualified',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::NEW => '#38BDF8',        // Cobalt Info
            self::RESEARCHED => '#A855F7', // Violet
            self::CONTACTED => '#F59E0B',  // Amber Warning
            self::REPLIED => '#EC4899',    // Pink
            self::QUALIFIED => '#10B981',  // Signal Emerald
            self::MEETING => '#6366F1',    // Indigo
            self::WON => '#059669',        // Deep Green
            self::LOST => '#64748B',       // Slate
        };
    }
}
