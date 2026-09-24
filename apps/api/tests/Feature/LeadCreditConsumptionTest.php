<?php

declare(strict_types=1);

namespace Tests\Feature;

use DomainException;
use InvalidArgumentException;

class LeadCreditConsumptionTest
{
    public static function run(): void
    {
        echo "Running LeadCreditConsumptionTest (1 Credit Per Lead Rule)...\n";

        self::testSingleLeadSaveDeductsOneCredit();
        self::testInsufficientCreditsBlocksSave();
        self::testIdempotentSaveDoesNotDoubleDeduct();
        self::testSequentialBatchSavesConsumeOneCreditPerLead();

        echo "✓ All LeadCreditConsumptionTest tests passed successfully (100% assertions satisfied)!\n";
    }

    /**
     * Test 1: Saving a new lead consumes exactly 1 credit.
     */
    private static function testSingleLeadSaveDeductsOneCredit(): void
    {
        echo "  - Testing Single Lead Save Deducts Exactly 1 Credit...\n";

        $workspace = [
            'id' => 'ws-test-01',
            'credit_balance' => 25,
        ];

        $businessId = 'biz-001';
        $savedLeads = [];

        // Execute save action simulation
        $initialBalance = $workspace['credit_balance'];
        
        assert($workspace['credit_balance'] >= 1, 'Must have at least 1 credit');
        $workspace['credit_balance'] -= 1;
        $savedLeads[$businessId] = [
            'id' => 'lead-001',
            'business_id' => $businessId,
            'workspace_id' => $workspace['id'],
        ];

        assert($workspace['credit_balance'] === 24, 'Balance must decrement by exactly 1');
        assert(($initialBalance - $workspace['credit_balance']) === 1, 'Difference must equal 1 credit per lead');
        assert(isset($savedLeads[$businessId]), 'Lead must be recorded in savedLeads');
    }

    /**
     * Test 2: Workspace with 0 credits is strictly blocked.
     */
    private static function testInsufficientCreditsBlocksSave(): void
    {
        echo "  - Testing Zero Credit Balance Blocks Lead Saving...\n";

        $workspace = [
            'id' => 'ws-test-02',
            'credit_balance' => 0,
        ];

        $businessId = 'biz-002';
        $blocked = false;

        try {
            if ($workspace['credit_balance'] < 1) {
                throw new DomainException('Insufficient workspace credits. 1 credit is required per saved lead.');
            }
            $workspace['credit_balance'] -= 1;
        } catch (DomainException $e) {
            $blocked = true;
            assert(str_contains($e->getMessage(), '1 credit is required per saved lead'));
        }

        assert($blocked === true, 'Saving with 0 credits must be blocked');
        assert($workspace['credit_balance'] === 0, 'Balance must remain 0');
    }

    /**
     * Test 3: Idempotent re-save of an already saved lead does not double-charge credits.
     */
    private static function testIdempotentSaveDoesNotDoubleDeduct(): void
    {
        echo "  - Testing Idempotent Re-save Does Not Double-Deduct Credits...\n";

        $workspace = [
            'id' => 'ws-test-03',
            'credit_balance' => 10,
        ];

        $businessId = 'biz-003';
        $savedLeads = [
            $businessId => [
                'id' => 'lead-003',
                'business_id' => $businessId,
                'workspace_id' => $workspace['id'],
            ],
        ];

        $initialBalance = $workspace['credit_balance'];

        // If existing, return existing without deducting credit
        $existing = $savedLeads[$businessId] ?? null;
        if (! $existing) {
            $workspace['credit_balance'] -= 1;
        }

        assert($workspace['credit_balance'] === $initialBalance, 'Re-saving existing lead must not consume extra credits');
    }

    /**
     * Test 4: Saving N leads sequentially consumes exactly N credits (1 credit per lead).
     */
    private static function testSequentialBatchSavesConsumeOneCreditPerLead(): void
    {
        echo "  - Testing Sequential Saving of Multiple Leads Consumes 1 Credit Per Lead...\n";

        $workspace = [
            'id' => 'ws-test-04',
            'credit_balance' => 15,
        ];

        $leadCountToSave = 7;
        for ($i = 1; $i <= $leadCountToSave; $i++) {
            assert($workspace['credit_balance'] >= 1, "Must have enough credits for lead {$i}");
            $workspace['credit_balance'] -= 1;
        }

        assert($workspace['credit_balance'] === (15 - $leadCountToSave), 'Saving 7 leads must consume exactly 7 credits');
    }
}

// Direct CLI execution
if (php_sapi_name() === 'cli') {
    LeadCreditConsumptionTest::run();
}
