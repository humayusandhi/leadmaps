<?php

declare(strict_types=1);

namespace App\Domain\Billing\Contracts;

interface PaymentProviderInterface
{
    /**
     * Create a new subscription checkout session with the payment provider.
     *
     * @param string $planCode
     * @param string $customerEmail
     * @param array<string, mixed> $metadata
     * @return array{
     *     subscription_id: string,
     *     checkout_url: string,
     *     key_id: string,
     *     amount: int,
     *     currency: string
     * }
     */
    public function createSubscription(string $planCode, string $customerEmail, array $metadata = []): array;

    /**
     * Cancel an existing subscription.
     *
     * @param string $subscriptionId
     * @return bool
     */
    public function cancelSubscription(string $subscriptionId): bool;

    /**
     * Verify HMAC-SHA256 signature for incoming webhooks.
     *
     * @param string $payload
     * @param string $signature
     * @param string $secret
     * @return bool
     */
    public function verifyWebhookSignature(string $payload, string $signature, string $secret): bool;
}
