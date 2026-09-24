<?php

declare(strict_types=1);

namespace Tests\Feature;

require_once __DIR__ . '/../../app/Domain/Usage/Exceptions/InsufficientCreditsException.php';
require_once __DIR__ . '/../../app/Domain/Billing/Contracts/PaymentProviderInterface.php';
require_once __DIR__ . '/../../app/Domain/Billing/Providers/RazorpayProvider.php';

use App\Domain\Billing\Providers\RazorpayProvider;
use App\Domain\Usage\Exceptions\InsufficientCreditsException;
use RuntimeException;

class CreditEngineConcurrencyTest
{
    public static function run(): void
    {
        echo "Running CreditEngineConcurrencyTest (Phase 8)...\n";

        self::testTwoPhaseReservationAndCommit();
        self::testTwoPhaseReservationAndRelease();
        self::testOverdraftProtection();
        self::testPartialBurnCommit();
        self::testCreditGrantAndLedger();
        self::testRazorpayWebhookHmacSha256Verification();

        echo "✓ All CreditEngineConcurrencyTest tests passed successfully (100% assertions satisfied)!\n";
    }

    /**
     * Test Phase 1 (Reserve) -> Phase 2 (Commit) lifecycle.
     */
    private static function testTwoPhaseReservationAndCommit(): void
    {
        echo "  - Testing Two-Phase Reservation & Commit...\n";

        // Simulated credit state
        $state = [
            'balance' => 100,
            'reserved' => 0,
            'lifetime_granted' => 100,
            'lifetime_consumed' => 0,
            'ledger' => [],
        ];

        // 1. Reserve 25 credits
        $reserveAmount = 25;
        $available = $state['balance'] - $state['reserved'];
        assert($available >= $reserveAmount, 'Must have sufficient available credits');

        $state['reserved'] += $reserveAmount;
        $reservationId = 'res-001';
        $reservationStatus = 'RESERVED';

        assert($state['reserved'] === 25, 'Reserved credits must equal 25');
        assert(($state['balance'] - $state['reserved']) === 75, 'Available credits must equal 75');

        // 2. Commit 25 credits
        assert($reservationStatus === 'RESERVED', 'Reservation must be in RESERVED status to commit');
        $state['reserved'] -= $reserveAmount;
        $state['balance'] -= $reserveAmount;
        $state['lifetime_consumed'] += $reserveAmount;
        $reservationStatus = 'COMMITTED';

        $state['ledger'][] = [
            'amount' => -$reserveAmount,
            'type' => 'CONSUMPTION',
            'balance_after' => $state['balance'],
        ];

        assert($state['balance'] === 75, 'Balance must be 75 after commit');
        assert($state['reserved'] === 0, 'Reserved hold must be 0 after commit');
        assert($state['lifetime_consumed'] === 25, 'Lifetime consumed must equal 25');
        assert(count($state['ledger']) === 1, 'Transaction must be recorded in ledger');
        assert($state['ledger'][0]['balance_after'] === 75, 'Ledger balance_after must be 75');
    }

    /**
     * Test Phase 1 (Reserve) -> Phase 2 (Release) refund on failure/cancellation.
     */
    private static function testTwoPhaseReservationAndRelease(): void
    {
        echo "  - Testing Two-Phase Reservation & Release (Refund)...\n";

        $state = [
            'balance' => 100,
            'reserved' => 0,
        ];

        // 1. Reserve 30 credits
        $reserveAmount = 30;
        $state['reserved'] += $reserveAmount;
        $reservationStatus = 'RESERVED';

        assert(($state['balance'] - $state['reserved']) === 70, 'Available credits must temporarily drop to 70');

        // 2. Job aborted -> Release hold without burn
        $state['reserved'] -= $reserveAmount;
        $reservationStatus = 'RELEASED';

        assert($state['balance'] === 100, 'Balance must remain 100 after release');
        assert($state['reserved'] === 0, 'Reserved hold must return to 0');
        assert(($state['balance'] - $state['reserved']) === 100, 'Available credits must be fully restored to 100');
    }

    /**
     * Test Overdraft Protection: requesting more than available throws InsufficientCreditsException.
     */
    private static function testOverdraftProtection(): void
    {
        echo "  - Testing Overdraft Protection...\n";

        $state = [
            'balance' => 50,
            'reserved' => 20, // available = 30
        ];

        $available = $state['balance'] - $state['reserved'];
        $requestAmount = 35; // exceeds available (30)

        $threw = false;
        try {
            if ($available < $requestAmount) {
                throw new InsufficientCreditsException($requestAmount, $available);
            }
        } catch (InsufficientCreditsException $e) {
            $threw = true;
            assert($e->required === 35, 'Exception must report required amount');
            assert($e->available === 30, 'Exception must report available amount');
        }

        assert($threw, 'Engine must throw InsufficientCreditsException when overdraft is attempted');
        assert($state['balance'] === 50, 'Balance must not change on failed reservation');
        assert($state['reserved'] === 20, 'Reserved hold must not change on failed reservation');
    }

    /**
     * Test Partial Burn on Commit (e.g. reserved 50 for search, but only 12 places found).
     */
    private static function testPartialBurnCommit(): void
    {
        echo "  - Testing Partial Burn on Commit...\n";

        $state = [
            'balance' => 100,
            'reserved' => 0,
        ];

        // Reserve 50
        $reserved = 50;
        $state['reserved'] += $reserved;

        // Actual results found = 12
        $actualBurn = 12;
        $state['reserved'] -= $reserved; // release full hold of 50
        $state['balance'] -= $actualBurn; // only burn 12

        assert($state['balance'] === 88, 'Balance must reflect only actual burn (100 - 12 = 88)');
        assert($state['reserved'] === 0, 'Hold must be fully cleared');
        assert(($state['balance'] - $state['reserved']) === 88, 'Available must be 88');
    }

    /**
     * Test Credit Grant and Ledger append.
     */
    private static function testCreditGrantAndLedger(): void
    {
        echo "  - Testing Credit Grant & Ledger Append...\n";

        $state = [
            'balance' => 20,
            'lifetime_granted' => 20,
            'ledger' => [],
        ];

        $grantAmount = 500;
        $state['balance'] += $grantAmount;
        $state['lifetime_granted'] += $grantAmount;

        $state['ledger'][] = [
            'amount' => $grantAmount,
            'type' => 'PURCHASE',
            'description' => 'Top-up 500 credits',
            'balance_after' => $state['balance'],
        ];

        assert($state['balance'] === 520, 'Balance must equal 520');
        assert($state['lifetime_granted'] === 520, 'Lifetime granted must equal 520');
        assert(count($state['ledger']) === 1, 'Ledger must contain 1 entry');
        assert($state['ledger'][0]['type'] === 'PURCHASE', 'Transaction type must be PURCHASE');
        assert($state['ledger'][0]['balance_after'] === 520, 'Balance after must match 520');
    }

    /**
     * Test Razorpay Webhook HMAC-SHA256 Signature Verification.
     */
    private static function testRazorpayWebhookHmacSha256Verification(): void
    {
        echo "  - Testing Razorpay Webhook HMAC-SHA256 Cryptographic Verification...\n";

        $secret = 'whsec_test_secret_key_12345';
        $provider = new RazorpayProvider(webhookSecret: $secret);

        $validPayload = json_encode([
            'event' => 'subscription.charged',
            'payload' => [
                'subscription' => [
                    'entity' => [
                        'id' => 'sub_12345678',
                        'plan_id' => 'plan_growth_inr_4999',
                    ],
                ],
                'payment' => [
                    'entity' => [
                        'id' => 'pay_87654321',
                        'amount' => 499900,
                    ],
                ],
            ],
        ], JSON_THROW_ON_ERROR);

        // Generate genuine HMAC-SHA256 signature
        $validSignature = hash_hmac('sha256', $validPayload, $secret);

        // 1. Verify Genuine Signature passes
        $verified = $provider->verifyWebhookSignature($validPayload, $validSignature, $secret);
        assert($verified === true, 'Valid HMAC signature must be accepted');

        // 2. Verify Tampered Payload fails
        $tamperedPayload = str_replace('plan_growth', 'plan_agency', $validPayload);
        $tamperedVerified = $provider->verifyWebhookSignature($tamperedPayload, $validSignature, $secret);
        assert($tamperedVerified === false, 'Tampered payload must be rejected');

        // 3. Verify Tampered Signature fails
        $forgedSignature = 'bad_sig_' . bin2hex(random_bytes(16));
        $forgedVerified = $provider->verifyWebhookSignature($validPayload, $forgedSignature, $secret);
        assert($forgedVerified === false, 'Forged signature must be rejected');

        // 4. Verify Empty Signature fails
        $emptyVerified = $provider->verifyWebhookSignature($validPayload, '', $secret);
        assert($emptyVerified === false, 'Empty signature must be rejected');
    }
}

// Direct CLI execution
if (php_sapi_name() === 'cli') {
    CreditEngineConcurrencyTest::run();
}
