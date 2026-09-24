<?php

declare(strict_types=1);

namespace App\Domain\Integration\Contracts;

interface CRMProviderInterface
{
    /**
     * Test connection credentials against external CRM API.
     *
     * @param array<string, mixed> $credentials
     * @return bool
     */
    public function testConnection(array $credentials): bool;

    /**
     * Synchronize a qualified lead to external CRM.
     *
     * @param object $lead
     * @param array<string, mixed> $credentials
     * @param array<string, mixed> $settings
     * @return array{
     *     success: bool,
     *     external_id: string,
     *     company_id?: string,
     *     contact_id?: string,
     *     message?: string,
     *     payload_sent: array<string, mixed>,
     *     response_received: array<string, mixed>
     * }
     */
    public function syncLead(object $lead, array $credentials, array $settings = []): array;

    /**
     * Update lead score in CRM.
     *
     * @param string $externalId
     * @param int $score
     * @param array<string, mixed> $credentials
     * @return bool
     */
    public function updateLeadScore(string $externalId, int $score, array $credentials): bool;
}
