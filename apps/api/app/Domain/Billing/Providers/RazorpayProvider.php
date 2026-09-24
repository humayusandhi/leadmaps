<?php

declare(strict_types=1);

namespace App\Domain\Billing\Providers;

use App\Domain\Billing\Contracts\PaymentProviderInterface;
use RuntimeException;

class RazorpayProvider implements PaymentProviderInterface
{
    public function __construct(
        private readonly string $keyId = 'rzp_test_leadmap_sandbox',
        private readonly string $keySecret = 'rzp_sec_leadmap_sandbox',
        private readonly string $webhookSecret = 'whsec_leadmap_hmac_secret'
    ) {}

    public function createSubscription(string $planCode, string $customerEmail, array $metadata = []): array
    {
        $planId = match (strtoupper($planCode)) {
            'STARTER' => 'plan_starter_inr_1999',
            'GROWTH' => 'plan_growth_inr_4999',
            'PRO' => 'plan_pro_inr_9999',
            'AGENCY' => 'plan_agency_inr_24999',
            default => 'plan_free',
        };

        $subscriptionId = 'sub_' . bin2hex(random_bytes(8));

        return [
            'subscription_id' => $subscriptionId,
            'checkout_url' => "https://api.razorpay.com/v1/checkout/embedded?sub_id={$subscriptionId}",
            'key_id' => $this->keyId,
            'amount' => match (strtoupper($planCode)) {
                'STARTER' => 199900,
                'GROWTH' => 499900,
                'PRO' => 999900,
                'AGENCY' => 2499900,
                default => 0,
            },
            'currency' => 'INR',
        ];
    }

    public function cancelSubscription(string $subscriptionId): bool
    {
        if (empty($subscriptionId)) {
            throw new RuntimeException('Subscription ID cannot be empty');
        }

        return true;
    }

    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool
    {
        if (empty($signature) || empty($secret)) {
            return false;
        }

        $expected = hash_hmac('sha256', $payload, $secret);

        return hash_equals($expected, $signature);
    }
}
