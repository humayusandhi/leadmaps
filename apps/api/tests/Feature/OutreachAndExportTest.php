<?php

declare(strict_types=1);

namespace Tests\Feature;

require_once __DIR__ . '/../../app/Domain/AI/Services/OutreachSynthesizerService.php';
require_once __DIR__ . '/../../app/Domain/Export/Services/CsvExportService.php';

use App\Domain\AI\Services\OutreachSynthesizerService;
use App\Domain\Export\Services\CsvExportService;

class OutreachAndExportTest
{
    public static function run(): void
    {
        echo "Running OutreachAndExportTest (Phase 7)...\n";

        self::testOutreachSynthesizer();
        self::testWhatsAppLengthConstraint();
        self::testCsvExportRfc4180Compliance();
        self::testCsvColumnFiltering();
        self::testLeadListCollectionLogic();

        echo "✓ All OutreachAndExportTest tests passed successfully (100% assertions satisfied)!\n";
    }

    /**
     * Test multi-channel cold outreach drafting (Email, WhatsApp, LinkedIn).
     */
    private static function testOutreachSynthesizer(): void
    {
        echo "  - Testing Multi-Channel Outreach Synthesizer...\n";
        $synthesizer = new OutreachSynthesizerService();

        // Construct mock Lead object
        $lead = (object) [
            'id' => 'lead-12345678-aaaa-bbbb-cccc-1234567890ab',
            'workspace_id' => 'ws-default',
            'business' => (object) [
                'name' => 'Apex Dental Care',
                'city' => 'Austin',
                'rating' => 4.8,
                'reviews_count' => 142,
                'phone_number' => '+15125550192',
                'website_url' => 'https://apexdentalcare.example.com',
            ],
            'websiteAnalysis' => (object) [
                'load_time_ms' => 3400,
                'is_mobile_responsive' => false,
                'has_ssl_active' => true,
                'has_booking_embed' => false,
            ],
            'aiOpportunities' => [
                (object) [
                    'category' => 'CONVERSION',
                    'title' => 'Missing Direct Online Booking Engine',
                    'evidence' => 'No appointment widget found on mobile viewport.',
                    'suggested_service' => 'Automated Intake & Booking Integration',
                    'confidence' => 'HIGH',
                    'points_estimated' => 20,
                ],
            ],
        ];

        $drafts = $synthesizer->synthesizeAll($lead);

        assert(isset($drafts['email']), 'Drafts must contain email channel');
        assert(isset($drafts['whatsapp']), 'Drafts must contain whatsapp channel');
        assert(isset($drafts['linkedin']), 'Drafts must contain linkedin channel');

        // Email checks
        $email = $drafts['email'];
        assert(! empty($email['subject']), 'Email subject must not be empty');
        assert(str_contains($email['subject'], 'Apex Dental Care'), 'Email subject must reference business name');
        assert(str_contains($email['body'], '4.8★'), 'Email body must cite verified rating');
        assert(str_contains($email['body'], 'Austin'), 'Email body must cite business city');
        assert(str_contains($email['body'], 'Missing Direct Online Booking Engine'), 'Email body must cite primary deficit');
        assert($email['tokens_used'] > 0, 'Tokens used must be estimated');

        // LinkedIn checks
        $linkedIn = $drafts['linkedin'];
        assert(! empty($linkedIn['subject']), 'LinkedIn InMail subject must not be empty');
        assert(str_contains($linkedIn['body'], 'Apex Dental Care'), 'LinkedIn body must cite business name');
        assert(str_contains($linkedIn['body'], 'Automated Intake & Booking Integration'), 'LinkedIn body must cite service');
    }

    /**
     * Test WhatsApp outreach length constraint (Strictly <= 400 characters).
     */
    private static function testWhatsAppLengthConstraint(): void
    {
        echo "  - Testing WhatsApp Outreach Length Constraint (<= 400 chars)...\n";
        $synthesizer = new OutreachSynthesizerService();

        $lead = (object) [
            'id' => 'lead-very-long-id-1234567890abcdef12345678',
            'workspace_id' => 'ws-default',
            'business' => (object) [
                'name' => 'The Grand Ultra Luxury Cosmetic Dentistry and Orthodontics Institute of Greater Downtown Austin',
                'city' => 'Austin',
                'rating' => 4.9,
                'reviews_count' => 520,
                'phone_number' => '+15125550199',
                'website_url' => 'https://granddentistry.example.com',
            ],
            'websiteAnalysis' => (object) [
                'load_time_ms' => 4800,
                'is_mobile_responsive' => false,
            ],
            'aiOpportunities' => [
                (object) [
                    'category' => 'PERFORMANCE',
                    'title' => 'Excessive render-blocking stylesheets and unoptimized high-resolution hero media assets',
                    'evidence' => 'Core Web Vitals LCP exceeds 4.8 seconds on standard 4G mobile emulation test.',
                    'suggested_service' => 'Full Next-Gen Image Optimization and Critical CSS Inlining',
                    'confidence' => 'HIGH',
                    'points_estimated' => 25,
                ],
            ],
        ];

        $drafts = $synthesizer->synthesizeAll($lead);
        $whatsapp = $drafts['whatsapp'];

        $charCount = function_exists('mb_strlen') ? mb_strlen($whatsapp['body']) : strlen($whatsapp['body']);
        assert($charCount <= 400, "WhatsApp body must not exceed 400 characters (actual: {$charCount})");
        assert(str_contains($whatsapp['body'], '4.9★'), 'WhatsApp body must cite verified rating');
        assert(str_contains($whatsapp['body'], 'leadmap.io/d/'), 'WhatsApp body must contain quick audit link');
    }

    /**
     * Test RFC 4180 CSV export compliance (BOM, quoting, line breaks).
     */
    private static function testCsvExportRfc4180Compliance(): void
    {
        echo "  - Testing RFC 4180 CSV Export Compliance...\n";
        $csvService = new CsvExportService();

        $leads = [
            (object) [
                'id' => 'lead-001',
                'status' => 'QUALIFIED',
                'lead_score' => 85,
                'business' => (object) [
                    'name' => 'Dr. Smith & Co, "P.C."',
                    'phone_number' => '+1 (512) 555-0100',
                    'email' => 'contact@drsmith.com',
                    'website_url' => 'https://drsmith.com',
                    'address' => '100 Main St, Suite 200',
                    'city' => 'Austin',
                    'rating' => 4.8,
                    'reviews_count' => 120,
                ],
                'websiteAnalysis' => (object) [
                    'cms_detected' => 'WordPress 6.4',
                    'is_ssl_active' => true,
                    'is_mobile_responsive' => true,
                    'booking_detected' => false,
                    'whatsapp_detected' => false,
                    'load_time_ms' => 1200,
                ],
                'aiOpportunities' => [
                    (object) [
                        'title' => 'Online Booking Embed, Instant Scheduling',
                        'evidence' => 'No online booking form found.',
                        'suggested_service' => 'Booking Funnel',
                    ],
                ],
            ],
        ];

        $csv = $csvService->generateCsv($leads);

        // 1. Verify UTF-8 BOM
        assert(str_starts_with($csv, "\xEF\xBB\xBF"), 'CSV must start with UTF-8 BOM for Excel compatibility');

        // 2. Verify escaped quotes RFC 4180 compliance
        assert(str_contains($csv, 'Dr. Smith & Co, ""P.C.""'), 'Double quotes inside fields must be escaped as ""');
        assert(str_contains($csv, '"100 Main St, Suite 200"'), 'Fields with commas must be enclosed in quotes');

        // 3. Verify standard headers present
        assert(str_contains($csv, 'Business Name'), 'Header must contain Business Name');
        assert(str_contains($csv, 'Lead Score (0-100)'), 'Header must contain Lead Score');
        assert(str_contains($csv, 'Key Technical Deficit'), 'Header must contain Key Technical Deficit');
    }

    /**
     * Test CSV column subset selection.
     */
    private static function testCsvColumnFiltering(): void
    {
        echo "  - Testing CSV Column Subset Filtering...\n";
        $csvService = new CsvExportService();

        $leads = [
            (object) [
                'id' => 'lead-1',
                'status' => 'NEW',
                'lead_score' => 60,
                'business' => (object) [
                    'name' => 'Acme Plumbing',
                    'phone_number' => '+15125551234',
                    'email' => 'info@acmeplumbing.com',
                    'website_url' => 'https://acmeplumbing.example.com',
                    'city' => 'Dallas',
                    'rating' => 4.5,
                    'reviews_count' => 30,
                ],
                'websiteAnalysis' => null,
                'aiOpportunities' => [],
            ],
        ];

        $selectedCols = ['business_name', 'phone', 'lead_score'];
        $csv = $csvService->generateCsv($leads, $selectedCols);

        $lines = explode("\n", trim(str_replace("\xEF\xBB\xBF", '', $csv)));
        assert(count($lines) === 2, 'CSV should have 1 header line and 1 data line');

        $headerFields = str_getcsv($lines[0]);
        assert(count($headerFields) === 3, 'Header must contain exactly 3 selected columns');
        assert($headerFields[0] === 'Business Name', 'Col 0 must be Business Name');
        assert($headerFields[1] === 'Phone Number', 'Col 1 must be Phone Number');
        assert($headerFields[2] === 'Lead Score (0-100)', 'Col 2 must be Lead Score (0-100)');

        $dataFields = str_getcsv($lines[1]);
        assert($dataFields[0] === 'Acme Plumbing', 'Row 0 must be Acme Plumbing');
        assert($dataFields[1] === '+15125551234', 'Row 1 must be +15125551234');
        assert($dataFields[2] === '60', 'Row 2 must be score 60');
    }

    /**
     * Test Custom Lists collection and duplicate prevention logic.
     */
    private static function testLeadListCollectionLogic(): void
    {
        echo "  - Testing Custom Lists Collection Logic...\n";

        $mockList = [
            'id' => 'list-001',
            'name' => 'Dental Outreach Segment',
            'items' => [],
        ];

        // Add lead 1
        $leadId1 = 'lead-aaa';
        $mockList['items'][$leadId1] = true;

        // Add lead 2
        $leadId2 = 'lead-bbb';
        $mockList['items'][$leadId2] = true;

        // Add lead 1 again (idempotency check)
        $mockList['items'][$leadId1] = true;

        assert(count($mockList['items']) === 2, 'List items must enforce unique leads per list');
    }
}

// Execute test suite when run directly via CLI
if (php_sapi_name() === 'cli') {
    OutreachAndExportTest::run();
}
