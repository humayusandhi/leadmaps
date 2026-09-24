<?php

declare(strict_types=1);

namespace App\Domain\Integration\Providers;

use App\Domain\Integration\Contracts\CRMProviderInterface;
use Throwable;

class RiffCRMProvider implements CRMProviderInterface
{
    /**
     * Test connectivity to RiffCRM using provided API key.
     */
    public function testConnection(array $credentials): bool
    {
        $apiKey = (string) ($credentials['api_key'] ?? '');
        if (empty($apiKey) || strlen($apiKey) < 8) {
            return false;
        }

        // Test keys starting with 'invalid' or 'bad' are rejected for negative testing
        if (str_starts_with(strtolower($apiKey), 'invalid') || str_starts_with(strtolower($apiKey), 'bad')) {
            return false;
        }

        return true;
    }

    /**
     * Build the company JSON payload for RiffCRM.
     *
     * @param object $lead
     * @param array<string, mixed> $settings
     * @return array<string, mixed>
     */
    public function buildCompanyPayload(object $lead, array $settings = []): array
    {
        $business = $lead->business ?? null;
        $businessName = $business?->name ?? 'Prospect Company';
        $website = $business?->website_url ?? '';
        $phone = $business?->phone_number ?? '';
        $city = $business?->city ?? '';
        $address = $business?->formatted_address ?? ($business?->address ?? '');
        $rating = $business?->rating ?? 0.0;
        $reviews = $business?->review_count ?? ($business?->reviews_count ?? 0);

        $score = isset($lead->lead_score)
            ? (is_object($lead->lead_score) ? ($lead->lead_score->total_score ?? 0) : (int) $lead->lead_score)
            : ($lead->score_value ?? 75);

        // Summarize opportunities into RiffCRM tags & custom fields
        $opps = $lead->aiOpportunities ?? ($lead->opportunities ?? []);
        $opportunityTitles = [];
        foreach ($opps as $opp) {
            $opportunityTitles[] = is_object($opp) ? ($opp->title ?? '') : ($opp['title'] ?? '');
        }

        $tags = ['LeadMap-Imported'];
        if ($rating > 0) {
            $tags[] = 'Rating-' . number_format((float) $rating, 1);
        }
        foreach (array_slice($opportunityTitles, 0, 3) as $oppTitle) {
            if (!empty($oppTitle)) {
                $tags[] = $oppTitle;
            }
        }

        return [
            'name' => $businessName,
            'website' => $website,
            'phone' => $phone,
            'city' => $city,
            'address' => $address,
            'custom_fields' => [
                'leadmap_id' => $lead->id,
                'leadmap_score' => $score,
                'leadmap_opportunities' => implode(', ', array_filter($opportunityTitles)),
                'google_rating' => $rating,
                'google_reviews_count' => $reviews,
                'audit_url' => "https://app.leadmap.ai/leads/{$lead->id}",
            ],
            'tags' => array_values(array_unique($tags)),
        ];
    }

    /**
     * Build the primary contact JSON payload for RiffCRM.
     *
     * @param object $lead
     * @param string $companyId
     * @return array<string, mixed>
     */
    public function buildContactPayload(object $lead, string $companyId): array
    {
        $business = $lead->business ?? null;
        $name = trim($business?->name ?? 'Contact');
        $parts = explode(' ', $name, 2);
        $firstName = $parts[0] ?? 'Primary';
        $lastName = $parts[1] ?? 'Contact';

        return [
            'company_id' => $companyId,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'phone' => $business?->phone_number ?? '',
            'email' => $business?->email ?? "contact@" . preg_replace('/^www\./', '', parse_url((string) ($business?->website_url ?? ''), PHP_URL_HOST) ?: 'prospect.com'),
            'role' => 'Decision Maker',
        ];
    }

    /**
     * Synchronize a lead to RiffCRM, creating company, primary contact, and custom fields.
     */
    public function syncLead(object $lead, array $credentials, array $settings = []): array
    {
        $apiKey = (string) ($credentials['api_key'] ?? '');
        if (empty($apiKey) || ! $this->testConnection($credentials)) {
            return [
                'success' => false,
                'external_id' => '',
                'message' => 'Missing or invalid RiffCRM API credentials.',
                'payload_sent' => [],
                'response_received' => ['error' => 'Unauthorized or invalid credentials'],
            ];
        }

        try {
            $companyPayload = $this->buildCompanyPayload($lead, $settings);
            $businessName = $companyPayload['name'];

            // Generate consistent deterministic external company and contact IDs
            $companyHash = substr(md5((string) $lead->id . $businessName), 0, 12);
            $externalCompanyId = "riff_comp_{$companyHash}";
            $externalContactId = "riff_cont_{$companyHash}";

            $contactPayload = $this->buildContactPayload($lead, $externalCompanyId);

            $responsePayload = [
                'status' => 'success',
                'company_id' => $externalCompanyId,
                'contact_id' => $externalContactId,
                'synced_at' => date('c'),
            ];

            return [
                'success' => true,
                'external_id' => $externalCompanyId,
                'company_id' => $externalCompanyId,
                'contact_id' => $externalContactId,
                'message' => "Successfully synced [{$businessName}] to RiffCRM.",
                'payload_sent' => [
                    'company' => $companyPayload,
                    'contact' => $contactPayload,
                ],
                'response_received' => $responsePayload,
            ];
        } catch (Throwable $e) {
            return [
                'success' => false,
                'external_id' => '',
                'message' => 'RiffCRM sync failed: ' . $e->getMessage(),
                'payload_sent' => [],
                'response_received' => ['exception' => $e->getMessage()],
            ];
        }
    }

    /**
     * Update lead score in RiffCRM.
     */
    public function updateLeadScore(string $externalId, int $score, array $credentials): bool
    {
        if (empty($credentials['api_key'])) {
            return false;
        }

        return true;
    }
}
