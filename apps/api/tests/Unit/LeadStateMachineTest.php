<?php

declare(strict_types=1);

namespace Tests\Unit;

require_once __DIR__ . '/../../app/Domain/Lead/Enums/LeadStatusEnum.php';

use App\Domain\Lead\Enums\LeadStatusEnum;
use DomainException;

class LeadStateMachineTest
{
    public static function run(): void
    {
        echo "Running LeadStateMachineTest...\n";

        // 1. Test Legal Transitions
        $legalTransitions = [
            [LeadStatusEnum::NEW, LeadStatusEnum::RESEARCHED],
            [LeadStatusEnum::NEW, LeadStatusEnum::CONTACTED],
            [LeadStatusEnum::NEW, LeadStatusEnum::LOST],
            [LeadStatusEnum::RESEARCHED, LeadStatusEnum::CONTACTED],
            [LeadStatusEnum::RESEARCHED, LeadStatusEnum::LOST],
            [LeadStatusEnum::CONTACTED, LeadStatusEnum::REPLIED],
            [LeadStatusEnum::CONTACTED, LeadStatusEnum::LOST],
            [LeadStatusEnum::REPLIED, LeadStatusEnum::QUALIFIED],
            [LeadStatusEnum::REPLIED, LeadStatusEnum::LOST],
            [LeadStatusEnum::QUALIFIED, LeadStatusEnum::MEETING],
            [LeadStatusEnum::QUALIFIED, LeadStatusEnum::WON],
            [LeadStatusEnum::QUALIFIED, LeadStatusEnum::LOST],
            [LeadStatusEnum::MEETING, LeadStatusEnum::WON],
            [LeadStatusEnum::MEETING, LeadStatusEnum::LOST],
            [LeadStatusEnum::LOST, LeadStatusEnum::NEW],
            [LeadStatusEnum::LOST, LeadStatusEnum::CONTACTED],
        ];

        foreach ($legalTransitions as [$from, $to]) {
            assert($from->canTransitionTo($to) === true, "Transition from {$from->value} to {$to->value} must be legal");
        }
        echo "  ✓ All 16 defined legal state machine transitions pass.\n";

        // 2. Test Illegal Transitions (Must be rejected)
        $illegalTransitions = [
            [LeadStatusEnum::NEW, LeadStatusEnum::WON],         // Direct skip to Won
            [LeadStatusEnum::NEW, LeadStatusEnum::MEETING],     // Direct skip to Meeting
            [LeadStatusEnum::RESEARCHED, LeadStatusEnum::WON],  // Direct skip to Won
            [LeadStatusEnum::CONTACTED, LeadStatusEnum::WON],   // Skip to Won without Reply/Qualified
            [LeadStatusEnum::WON, LeadStatusEnum::LOST],        // Won is terminal
            [LeadStatusEnum::WON, LeadStatusEnum::NEW],         // Won is terminal
        ];

        foreach ($illegalTransitions as [$from, $to]) {
            assert($from->canTransitionTo($to) === false, "Transition from {$from->value} to {$to->value} must be illegal");

            $caught = false;
            try {
                $from->assertCanTransitionTo($to);
            } catch (DomainException $e) {
                $caught = true;
                assert(str_contains($e->getMessage(), 'Illegal lead status transition'), 'Exception must be explicit');
            }
            assert($caught, "Illegal transition {$from->value} -> {$to->value} must throw DomainException");
        }
        echo "  ✓ All 6 illegal state transitions throw DomainException as expected.\n";

        echo "LEAD STATE MACHINE TESTS PASSED GREEN!\n";
    }
}

LeadStateMachineTest::run();
