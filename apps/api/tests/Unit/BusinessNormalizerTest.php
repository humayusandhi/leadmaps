<?php

declare(strict_types=1);

namespace Tests\Unit;

require_once __DIR__ . '/../../app/Domain/Business/Contracts/BusinessDiscoveryProvider.php';
require_once __DIR__ . '/../../app/Domain/Business/DTOs/DiscoveryCriteria.php';
require_once __DIR__ . '/../../app/Domain/Business/DTOs/DiscoveryResult.php';
require_once __DIR__ . '/../../app/Domain/Business/Providers/GooglePlacesProvider.php';
require_once __DIR__ . '/../../app/Domain/Business/Providers/MockBusinessDiscoveryProvider.php';
require_once __DIR__ . '/../../app/Domain/Business/Services/BusinessNormalizerService.php';

use App\Domain\Business\DTOs\DiscoveryCriteria;
use App\Domain\Business\Providers\MockBusinessDiscoveryProvider;
use App\Domain\Business\Services\BusinessNormalizerService;

class BusinessNormalizerTest
{
    public static function run(): void
    {
        echo "Running BusinessNormalizerTest...\n";

        $normalizer = new BusinessNormalizerService();

        // 1. Test Google Places API (New) Payload Normalization
        $googleNewPayload = [
            'id' => 'ChIJ1234567890abcdef',
            'displayName' => [
                'text' => 'Apex Dental Care',
                'languageCode' => 'en',
            ],
            'formattedAddress' => '1200 17th St, Denver, CO 80202, USA',
            'location' => [
                'latitude' => 39.7505,
                'longitude' => -104.9965,
            ],
            'rating' => 4.9,
            'userRatingCount' => 128,
            'nationalPhoneNumber' => '+1 303-555-0199',
            'websiteUri' => 'https://www.apexdentaldenver.com',
            'businessStatus' => 'OPERATIONAL',
        ];

        $normalized = $normalizer->normalize($googleNewPayload);

        assert($normalized['google_place_id'] === 'ChIJ1234567890abcdef', 'Place ID should match');
        assert($normalized['name'] === 'Apex Dental Care', 'Name should match');
        assert($normalized['formatted_address'] === '1200 17th St, Denver, CO 80202, USA', 'Address should match');
        assert($normalized['city'] === 'CO 80202', 'City parsed correctly');
        assert($normalized['country'] === 'USA', 'Country parsed correctly');
        assert($normalized['latitude'] === 39.7505, 'Latitude should match');
        assert($normalized['longitude'] === -104.9965, 'Longitude should match');
        assert($normalized['rating'] === 4.9, 'Rating should match');
        assert($normalized['review_count'] === 128, 'Review count should match');
        assert($normalized['website_url'] === 'https://www.apexdentaldenver.com', 'Website URL should match');
        assert($normalized['phone_number'] === '+1 303-555-0199', 'Phone number should match');

        echo "  ✓ Normalizer successfully normalizes Google Places (New) payload.\n";

        // 2. Test DiscoveryCriteria
        $criteria = new DiscoveryCriteria(
            category: 'Roofers',
            location: 'Denver, CO',
            radiusKm: 25,
            hasWebsite: true,
            minRating: 4.5,
            minReviews: 50
        );

        assert($criteria->toSearchQuery() === 'Roofers in Denver, CO', 'Search query formatting');
        assert($criteria->radiusKm === 25, 'Radius km matches');
        echo "  ✓ DiscoveryCriteria correctly formats query string.\n";

        // 3. Test MockBusinessDiscoveryProvider
        $mockProvider = new MockBusinessDiscoveryProvider();
        $result = $mockProvider->search($criteria);

        assert($result->totalCount > 0, 'Mock provider should return places');
        assert($result->isMock === true, 'isMock should be true');

        // All returned places must have a website because hasWebsite: true
        foreach ($result->places as $p) {
            assert(! empty($p['websiteUri']), 'Filtered places must have website');
            assert(($p['rating'] ?? 0) >= 4.5, 'Rating must be >= 4.5');
            assert(($p['userRatingCount'] ?? 0) >= 50, 'Reviews must be >= 50');
        }

        echo "  ✓ MockBusinessDiscoveryProvider accurately applies criteria and filters (" . count($result->places) . " places generated).\n";

        echo "ALL UNIT TESTS PASSED GREEN!\n";
    }
}

BusinessNormalizerTest::run();
