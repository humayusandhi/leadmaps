<?php

declare(strict_types=1);

namespace App\Domain\Billing\Providers;

use App\Domain\Billing\Contracts\PaymentProviderInterface;

class MockPaymentProvider implements PaymentProviderInterface
{
    public function createSubscription(string $planCode, string $customerEmail, array $metadata = []): array
    {
        $subId = 'sub_mock_' . bin2hex(random_bytes(6));

        return [
            'subscription_id' => $subId,
            'checkout_url' => "http://localhost:3000/billing?mock_sub={$subId}",
            'key_id' => 'rzp_test_mock_key',
            'amount' => 199900,
            'currency' => 'INR',
        ];
    }

    public function cancelSubscription(string $subscriptionId): bool
    {
        return true;
    }

    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool
    {
        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $signature);
    }
}
