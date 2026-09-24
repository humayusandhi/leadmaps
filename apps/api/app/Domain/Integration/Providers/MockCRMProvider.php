<?php

declare(strict_types=1);

namespace App\Domain\Integration\Providers;

use App\Domain\Integration\Contracts\CRMProviderInterface;

class MockCRMProvider implements CRMProviderInterface
{
    /**
     * Test connection credentials against external CRM API.
     *
     * @param array<string, mixed> $credentials
     * @return bool
     */
    public function testConnection(array $credentials): bool
    {
        $apiKey = $credentials['api_key'] ?? '';
        if (empty($apiKey) || $apiKey === 'invalid_key') {
            return false;
        }

        return true;
    }

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
    public function syncLead(object $lead, array $credentials, array $settings = []): array
    {
        $apiKey = $credentials['api_key'] ?? '';
        if ($apiKey === 'fail_sync' || ($lead->name ?? '') === 'Trigger Sync Error') {
            return [
                'success' => false,
                'external_id' => '',
                'message' => 'Simulated CRM provider sync failure.',
                'payload_sent' => ['lead_id' => $lead->id ?? null, 'name' => $lead->name ?? null],
                'response_received' => ['error' => 'Simulated upstream error 500']
            ];
        }

        $leadId = $lead->id ?? 'unknown';
        $companyId = 'mock_comp_' . substr(md5((string) $leadId), 0, 10);
        $contactId = 'mock_cont_' . substr(md5((string) $leadId . '_contact'), 0, 10);

        return [
            'success' => true,
            'external_id' => $companyId,
            'company_id' => $companyId,
            'contact_id' => $contactId,
            'message' => 'Successfully synced to Mock CRM.',
            'payload_sent' => [
                'name' => $lead->name ?? 'Unknown',
                'website' => $lead->website ?? null,
                'phone' => $lead->phone ?? null,
            ],
            'response_received' => [
                'status' => 'created',
                'id' => $companyId,
                'contact_id' => $contactId
            ]
        ];
    }

    /**
     * Update lead score in CRM.
     *
     * @param string $externalId
     * @param int $score
     * @param array<string, mixed> $credentials
     * @return bool
     */
    public function updateLeadScore(string $externalId, int $score, array $credentials): bool
    {
        return !empty($externalId);
    }
}
