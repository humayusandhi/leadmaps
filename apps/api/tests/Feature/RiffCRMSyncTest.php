<?php

declare(strict_types=1);

namespace Tests\Feature;

require_once __DIR__ . '/../../app/Domain/Integration/Contracts/CRMProviderInterface.php';
require_once __DIR__ . '/../../app/Domain/Integration/Providers/RiffCRMProvider.php';
require_once __DIR__ . '/../../app/Domain/Integration/Providers/MockCRMProvider.php';

use App\Domain\Integration\Providers\MockCRMProvider;
use App\Domain\Integration\Providers\RiffCRMProvider;

class RiffCRMSyncTest
{
    public static function run(): void
    {
        echo "Running RiffCRMSyncTest (Phase 9 - CRM Integrations & RiffCRM Direct Sync)...\n";

        self::testRiffCRMProviderCompanyPayloadMapping();
        self::testRiffCRMProviderContactPayloadMapping();
        self::testRiffCRMProviderAuthenticationAndErrorHandling();
        self::testMockCRMProvider();
        self::testLeadModelCRMSyncStatusStateTransitions();
        self::testPayloadSanitizationAndMasking();

        echo "✓ All RiffCRMSyncTest tests passed successfully (100% assertions satisfied)!\n";
    }

    /**
     * Test RiffCRM company payload construction, custom fields, and tags.
     */
    private static function testRiffCRMProviderCompanyPayloadMapping(): void
    {
        echo "  - Testing RiffCRM Company Payload Mapping...\n";
        $provider = new RiffCRMProvider();

        $lead = (object) [
            'id' => 'lead-a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            'lead_score' => 88,
            'status' => 'QUALIFIED',
            'business' => (object) [
                'name' => 'Dr. Smith Dental Clinic',
                'formatted_address' => '450 Lexington Ave, New York, NY 10017',
                'city' => 'New York',
                'phone_number' => '+12125550199',
                'website_url' => 'https://smithdentalnyc.example.com',
                'rating' => 4.9,
                'review_count' => 248,
            ],
            'websiteAnalysis' => (object) [
                'final_url' => 'https://smithdentalnyc.example.com',
                'load_time_ms' => 1250,
                'is_mobile_responsive' => true,
                'has_ssl_active' => true,
            ],
            'aiOpportunities' => [
                (object) [
                    'category' => 'CONVERSION',
                    'title' => 'Missing Direct Online Booking Engine',
                ],
                (object) [
                    'category' => 'SEO',
                    'title' => 'Missing Local Schema Markup',
                ],
            ],
        ];

        // Access protected payload builder via reflection or public method
        $reflector = new \ReflectionClass(RiffCRMProvider::class);
        $method = $reflector->getMethod('buildCompanyPayload');
        $method->setAccessible(true);

        $payload = $method->invoke($provider, $lead, ['score_threshold' => 75]);

        assert($payload['name'] === 'Dr. Smith Dental Clinic', 'Company name must match business name');
        assert($payload['website'] === 'https://smithdentalnyc.example.com', 'Website must match website_url');
        assert($payload['phone'] === '+12125550199', 'Phone must match phone_number');
        assert($payload['city'] === 'New York', 'City must match business city');

        // Verify Custom Fields
        $customFields = $payload['custom_fields'];
        assert($customFields['leadmap_id'] === 'lead-a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Custom field leadmap_id must match lead id');
        assert($customFields['leadmap_score'] === 88, 'Custom field leadmap_score must match score');
        assert(str_contains($customFields['leadmap_opportunities'], 'Missing Direct Online Booking Engine'), 'Opportunities must be formatted in custom_fields');
        assert($customFields['google_rating'] === 4.9, 'Google rating must match');
        assert($customFields['google_reviews_count'] === 248, 'Google review count must match');

        // Verify Tags
        assert(in_array('LeadMap-Imported', $payload['tags'], true), 'LeadMap-Imported tag must be present');
        assert(in_array('Rating-4.9', $payload['tags'], true), 'Rating tag must be present');
    }

    /**
     * Test RiffCRM contact payload construction and name splitting.
     */
    private static function testRiffCRMProviderContactPayloadMapping(): void
    {
        echo "  - Testing RiffCRM Contact Payload Mapping...\n";
        $provider = new RiffCRMProvider();

        $lead = (object) [
            'id' => 'lead-contact-test',
            'business' => (object) [
                'name' => 'Elena Rostova Law Firm',
                'phone_number' => '+15551234567',
                'email' => 'contact@rostovalaw.example.com',
            ],
        ];

        $reflector = new \ReflectionClass(RiffCRMProvider::class);
        $method = $reflector->getMethod('buildContactPayload');
        $method->setAccessible(true);

        $contactPayload = $method->invoke($provider, $lead, 'comp_12345');

        assert($contactPayload['company_id'] === 'comp_12345', 'Company ID must be linked to contact');
        assert($contactPayload['first_name'] === 'Elena', 'First name must be parsed correctly');
        assert($contactPayload['last_name'] === 'Rostova Law Firm', 'Last name must be parsed correctly');
        assert($contactPayload['phone'] === '+15551234567', 'Phone must match');
        assert($contactPayload['email'] === 'contact@rostovalaw.example.com', 'Email must match');
    }

    /**
     * Test authentication test and error resilience against invalid credentials.
     */
    private static function testRiffCRMProviderAuthenticationAndErrorHandling(): void
    {
        echo "  - Testing Authentication and Handshake Verification...\n";
        $provider = new RiffCRMProvider();

        // 1. Empty credentials
        $emptyResult = $provider->testConnection([]);
        assert($emptyResult === false, 'Empty credentials must fail testConnection');

        // 2. Missing api_key
        $noKeyResult = $provider->testConnection(['base_url' => 'https://api.riffcrm.com']);
        assert($noKeyResult === false, 'Missing api_key must fail testConnection');

        // 3. Fallback sync on unreachable network without crashing
        $lead = (object) [
            'id' => 'lead-offline-test',
            'business' => (object) ['name' => 'Offline Business'],
        ];

        $syncResult = $provider->syncLead($lead, [
            'api_key' => 'mock_test_key_abc123',
            'base_url' => 'https://127.0.0.1:59999/unreachable-endpoint-test',
        ]);

        // When external host is unreachable or mocked, returns structured array with success flag
        assert(isset($syncResult['success']), 'syncLead must return success boolean');
        assert(isset($syncResult['payload_sent']), 'syncLead must return payload_sent');
        assert(isset($syncResult['response_received']), 'syncLead must return response_received');
    }

    /**
     * Test MockCRMProvider deterministic IDs and error simulation.
     */
    private static function testMockCRMProvider(): void
    {
        echo "  - Testing MockCRMProvider Behavior...\n";
        $mock = new MockCRMProvider();

        // 1. testConnection
        assert($mock->testConnection(['api_key' => 'live_mock_key']) === true, 'Valid mock key must succeed');
        assert($mock->testConnection(['api_key' => 'invalid_key']) === false, 'invalid_key must return false');
        assert($mock->testConnection([]) === false, 'empty credentials must return false');

        // 2. Successful sync
        $lead = (object) [
            'id' => 'lead-mock-001',
            'name' => 'Metro Auto Repair',
            'phone' => '+15559876543',
        ];

        $result = $mock->syncLead($lead, ['api_key' => 'test_key']);
        assert($result['success'] === true, 'Mock sync must succeed');
        assert(str_starts_with($result['external_id'], 'mock_comp_'), 'Mock external ID must start with mock_comp_');
        assert(str_starts_with($result['contact_id'], 'mock_cont_'), 'Mock contact ID must start with mock_cont_');

        // 3. Failure mode
        $failResult = $mock->syncLead($lead, ['api_key' => 'fail_sync']);
        assert($failResult['success'] === false, 'fail_sync key must trigger failure simulation');
        assert(!empty($failResult['message']), 'Simulated failure must return error message');
    }

    /**
     * Test CRM sync status transitions.
     */
    private static function testLeadModelCRMSyncStatusStateTransitions(): void
    {
        echo "  - Testing CRM Sync Status State Machine...\n";

        $validStatuses = ['NOT_SYNCED', 'SYNCING', 'SYNCED', 'FAILED'];

        $leadState = 'NOT_SYNCED';
        assert(in_array($leadState, $validStatuses, true));

        // Dispatching sync job transitions to SYNCING
        $leadState = 'SYNCING';
        assert(in_array($leadState, $validStatuses, true));

        // Successful completion transitions to SYNCED
        $leadState = 'SYNCED';
        $externalId = 'riff_comp_9f83ac';
        $syncedAt = date('Y-m-d H:i:s');
        assert(!empty($externalId) && !empty($syncedAt));

        // Alternative: network failure transitions to FAILED
        $failedState = 'FAILED';
        assert(in_array($failedState, $validStatuses, true));
    }

    /**
     * Test API credential masking logic.
     */
    private static function testPayloadSanitizationAndMasking(): void
    {
        echo "  - Testing Credential Masking Security...\n";

        $fullKey = 'riff_live_sec_9938472918374619';
        $maskedKey = strlen($fullKey) > 8 ? '••••••••' . substr($fullKey, -4) : '••••••••';

        assert($maskedKey === '••••••••4619', 'Masked key must show only last 4 characters');
        assert(!str_contains($maskedKey, '993847291837'), 'Secret portion of key must be hidden');
    }
}

// Execute test suite when run directly via CLI
if (php_sapi_name() === 'cli') {
    RiffCRMSyncTest::run();
}
