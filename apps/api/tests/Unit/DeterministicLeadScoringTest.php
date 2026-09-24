<?php

declare(strict_types=1);

namespace Tests\Unit;

require_once __DIR__ . '/../../app/Domain/Lead/Services/DeterministicLeadScoringService.php';

use App\Domain\Lead\Services\DeterministicLeadScoringService;

class DeterministicLeadScoringTest
{
    public static function run(): void
    {
        echo "Running DeterministicLeadScoringTest...\n";
        $service = new DeterministicLeadScoringService();

        // 1. Prime Business Profile (Top-Tier Digital Health & Reputation)
        $primeBiz = [
            'google_place_id' => 'ChIJ_prime_place_123',
            'name' => 'Apex Dental Care',
            'phone_number' => '+1 303-555-0100',
            'website_url' => 'https://www.apexdentaldenver.com',
            'rating' => 4.9,
            'review_count' => 142,
        ];

        $primeAnalysis = [
            'url' => 'https://www.apexdentaldenver.com',
            'is_ssl_active' => true,
            'load_time_ms' => 420,
            'is_mobile_responsive' => true,
            'raw_signals' => [
                'technical' => [
                    'security_headers' => ['hsts' => true, 'x_content_type_options' => true],
                ],
            ],
            'has_meta_description' => true,
            'has_open_graph' => true,
            'has_schema_markup' => true,
            'h1_tags' => ['Apex Dental Care Denver'],
            'has_cta' => true,
            'has_contact_form' => true,
            'has_tel_links' => true,
            'has_whatsapp_chat' => true,
            'has_booking_embed' => true,
        ];

        $primeResult = $service->calculate($primeBiz, $primeAnalysis);

        assert($primeResult['total_score'] === 100, "Prime profile must achieve 100 points, got {$primeResult['total_score']}");
        assert(count($primeResult['breakdown']) === 4, 'Breakdown must contain exactly 4 dimensions');

        $breakdownSum = 0;
        foreach ($primeResult['breakdown'] as $item) {
            assert($item['awarded_points'] <= $item['max_points'], "Points awarded cannot exceed max for {$item['dimension']}");
            $breakdownSum += $item['awarded_points'];
        }
        assert($breakdownSum === $primeResult['total_score'], 'Sum of breakdown points must equal total_score');

        // 2. Severe Deficit Profile (No Website, Low Reviews)
        $coldBiz = [
            'google_place_id' => null,
            'name' => 'Rusty Auto Repair',
            'phone_number' => null,
            'website_url' => null,
            'rating' => 3.2,
            'review_count' => 3,
        ];

        $coldResult = $service->calculate($coldBiz, null);

        assert($coldResult['total_score'] >= 0 && $coldResult['total_score'] <= 10, "Deficit profile must have very low score, got {$coldResult['total_score']}");
        assert($coldResult['breakdown'][0]['awarded_points'] === 0, 'No website must yield 0 technical points');
        assert($coldResult['breakdown'][1]['awarded_points'] === 0, 'No website must yield 0 SEO points');
        assert($coldResult['breakdown'][2]['awarded_points'] === 0, 'No website must yield 0 conversion points');

        // 3. Mathematical Determinism Check (100 sequential runs must be byte-for-byte identical)
        $initialSerialized = json_encode($primeResult);
        for ($i = 0; $i < 100; $i++) {
            $iterationResult = $service->calculate($primeBiz, $primeAnalysis);
            assert(json_encode($iterationResult) === $initialSerialized, 'Scoring must be strictly deterministic across iterations');
        }

        echo "DeterministicLeadScoringTest passed successfully! (100% assertions satisfied)\n";
    }
}

if (php_sapi_name() === 'cli' && realpath($argv[0]) === realpath(__FILE__)) {
    DeterministicLeadScoringTest::run();
}
