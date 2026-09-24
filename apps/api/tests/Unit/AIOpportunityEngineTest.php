<?php

declare(strict_types=1);

namespace Tests\Unit;

require_once __DIR__ . '/../../app/Domain/AI/Contracts/AIProviderInterface.php';
require_once __DIR__ . '/../../app/Domain/AI/Services/AIOpportunitySchemaValidator.php';
require_once __DIR__ . '/../../app/Domain/AI/Providers/MockAIProvider.php';

use App\Domain\AI\Providers\MockAIProvider;
use App\Domain\AI\Services\AIOpportunitySchemaValidator;
use InvalidArgumentException;

class AIOpportunityEngineTest
{
    public static function run(): void
    {
        echo "Running AIOpportunityEngineTest...\n";
        $validator = new AIOpportunitySchemaValidator();

        // 1. Test Schema Validator on Valid Payload
        $validPayload = [
            'opportunities' => [
                [
                    'category' => 'BOOKING',
                    'title' => 'Automated Appointment Booking Funnel',
                    'evidence' => 'No self-scheduling widget detected in DOM.',
                    'suggested_service' => 'Calendly & Stripe Automated Intake Funnel',
                    'confidence' => 'HIGH',
                    'points_estimated' => 20,
                ],
                [
                    'category' => 'LOCAL_SEO',
                    'title' => 'LocalBusiness Schema Markup Entity Injection',
                    'evidence' => 'No JSON-LD structured data in header.',
                    'suggested_service' => 'Schema.org Rich Snippet Optimization',
                    'confidence' => 'MEDIUM',
                    'points_estimated' => 18,
                ],
            ],
        ];

        $sanitized = $validator->validate($validPayload);
        assert(count($sanitized) === 2, 'Validator must retain both valid opportunities');
        assert($sanitized[0]['category'] === 'BOOKING', 'Category must be BOOKING');
        assert($sanitized[0]['confidence'] === 'HIGH', 'Confidence must be HIGH');
        assert($sanitized[1]['category'] === 'LOCAL_SEO', 'Category must be LOCAL_SEO');

        // 2. Test Rejection on Malformed Payload
        $malformedPayload = [
            'opportunities' => [
                [
                    'title' => '', // missing title
                    'evidence' => '', // missing evidence
                ],
            ],
        ];

        $threw = false;
        try {
            $validator->validate($malformedPayload);
        } catch (InvalidArgumentException $e) {
            $threw = true;
        }
        assert($threw === true, 'Validator must throw InvalidArgumentException when zero valid opportunities exist');

        // 3. Test Mock AI Provider Synthesis
        // Create an anonymous mock lead
        $mockLead = new class {
            public string $id = 'lead-mock-01';
            public $business;
            public $websiteAnalysis = null;

            public function __construct() {
                $this->business = (object) [
                    'name' => 'Mile High Precision HVAC',
                    'formatted_address' => '2100 Larimer St, Denver, CO 80205',
                    'phone_number' => '+1 303-555-0188',
                    'website_url' => 'https://www.milehighprecisionhvac.com',
                    'rating' => 4.3,
                    'review_count' => 18,
                ];
            }
        };

        $signals = [
            'is_ssl_active' => true,
            'load_time_ms' => 1120, // slow latency
            'has_cta' => true,
            'has_contact_form' => true,
            'has_tel_links' => true,
            'has_whatsapp_chat' => false, // missing whatsapp
            'has_booking_embed' => false,  // missing booking
            'has_schema_markup' => false, // missing schema
            'has_open_graph' => false,
        ];

        $provider = new MockAIProvider();
        /** @var \App\Domain\Lead\Models\Lead $leadAdapter */
        $leadAdapter = $mockLead;
        $aiResult = $provider->analyze($leadAdapter, $signals);

        assert(! empty($aiResult['opportunities']), 'MockAIProvider must generate opportunities');
        assert($aiResult['model_used'] === 'mock-ai-engine-v1', 'Model name must match');
        assert($aiResult['tokens_prompt'] > 0, 'Tokens prompt must be tracked');

        // Run validator on MockAIProvider output
        $validatedMockOutput = $validator->validate($aiResult['opportunities']);
        assert(! empty($validatedMockOutput), 'MockAIProvider output must satisfy schema validation');

        $categories = array_column($validatedMockOutput, 'category');
        assert(in_array('BOOKING', $categories, true), 'Missing booking embed must yield BOOKING opportunity');
        assert(in_array('WHATSAPP', $categories, true), 'Missing WhatsApp must yield WHATSAPP opportunity');

        echo "AIOpportunityEngineTest passed successfully! (100% assertions satisfied)\n";
    }
}

if (php_sapi_name() === 'cli' && realpath($argv[0]) === realpath(__FILE__)) {
    AIOpportunityEngineTest::run();
}
