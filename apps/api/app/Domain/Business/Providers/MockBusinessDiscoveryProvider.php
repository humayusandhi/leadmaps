<?php

declare(strict_types=1);

namespace App\Domain\Business\Providers;

use App\Domain\Business\Contracts\BusinessDiscoveryProvider;
use App\Domain\Business\DTOs\DiscoveryCriteria;
use App\Domain\Business\DTOs\DiscoveryResult;

class MockBusinessDiscoveryProvider implements BusinessDiscoveryProvider
{
    /**
     * City center coordinates lookup for realistic geospatial clustering.
     */
    private const CITY_CENTERS = [
        'denver' => ['lat' => 39.7392, 'lng' => -104.9903, 'city' => 'Denver, CO'],
        'austin' => ['lat' => 30.2672, 'lng' => -97.7431, 'city' => 'Austin, TX'],
        'chicago' => ['lat' => 41.8781, 'lng' => -87.6298, 'city' => 'Chicago, IL'],
        'seattle' => ['lat' => 47.6062, 'lng' => -122.3321, 'city' => 'Seattle, WA'],
        'dallas' => ['lat' => 32.7767, 'lng' => -96.7970, 'city' => 'Dallas, TX'],
        'miami' => ['lat' => 25.7617, 'lng' => -80.1918, 'city' => 'Miami, FL'],
        'new york' => ['lat' => 40.7128, 'lng' => -74.0060, 'city' => 'New York, NY'],
    ];

    public function search(DiscoveryCriteria $criteria): DiscoveryResult
    {
        $locationLower = strtolower($criteria->location);
        $center = ['lat' => 39.7392, 'lng' => -104.9903, 'city' => ucwords($criteria->location)];

        foreach (self::CITY_CENTERS as $cityKey => $coords) {
            if (str_contains($locationLower, $cityKey)) {
                $center = $coords;
                break;
            }
        }

        if ($criteria->latitude !== null && $criteria->longitude !== null) {
            $center['lat'] = $criteria->latitude;
            $center['lng'] = $criteria->longitude;
        }

        $places = $this->generateMockPlaces($criteria, $center);

        // Apply criteria filters if specified
        if ($criteria->hasWebsite !== null) {
            $places = array_values(array_filter($places, function ($p) use ($criteria) {
                $hasWeb = ! empty($p['websiteUri']);
                return $hasWeb === $criteria->hasWebsite;
            }));
        }

        if ($criteria->minRating !== null) {
            $places = array_values(array_filter($places, function ($p) use ($criteria) {
                return ($p['rating'] ?? 0) >= $criteria->minRating;
            }));
        }

        if ($criteria->minReviews !== null) {
            $places = array_values(array_filter($places, function ($p) use ($criteria) {
                return ($p['userRatingCount'] ?? 0) >= $criteria->minReviews;
            }));
        }

        return new DiscoveryResult(
            places: $places,
            totalCount: count($places),
            isMock: true,
            metadata: [
                'provider' => 'mock_discovery_provider',
                'query' => $criteria->toSearchQuery(),
                'center' => $center,
            ]
        );
    }

    /**
     * Generate 15-20 realistic businesses with spatial coordinates within the radius.
     *
     * @param DiscoveryCriteria $criteria
     * @param array{lat: float, lng: float, city: string} $center
     * @return array<int, array<string, mixed>>
     */
    private function generateMockPlaces(DiscoveryCriteria $criteria, array $center): array
    {
        $category = trim($criteria->category);
        if (empty($category)) {
            $category = 'Commercial Services';
        }

        $templates = [
            ['Apex %s Solutions', true, 4.9, 142, '+1 303-555-0101', 'apex%s.com'],
            ['Mile High %s Group', true, 4.7, 89, '+1 303-555-0102', 'milehigh%s.com'],
            ['Front Range %s Co.', true, 4.8, 215, '+1 303-555-0103', 'frontrange%s.com'],
            ['Summit %s & Repair', false, 4.2, 34, '+1 303-555-0104', null],
            ['Precision %s Pros', true, 4.6, 78, '+1 303-555-0105', 'precision%s.net'],
            ['Integrity %s Specialists', true, 5.0, 63, '+1 303-555-0106', 'integrity%s.co'],
            ['Elevated %s Services', false, 3.9, 19, '+1 303-555-0107', null],
            ['Metro %s Care Center', true, 4.5, 110, '+1 303-555-0108', 'metro%scare.org'],
            ['Guardian %s Masters', true, 4.4, 52, '+1 303-555-0109', 'guardian%s.com'],
            ['All-Pro %s Experts', false, 4.1, 28, '+1 303-555-0110', null],
            ['Pinnacle %s Tech', true, 4.9, 184, '+1 303-555-0111', 'pinnacle%s.io'],
            ['Downtown %s Studio', true, 4.3, 47, '+1 303-555-0112', 'downtown%s.com'],
            ['Vanguard %s Associates', true, 4.8, 95, '+1 303-555-0113', 'vanguard%s.com'],
            ['Legacy %s Works', false, 3.8, 15, '+1 303-555-0114', null],
            ['Horizon %s Partners', true, 4.7, 131, '+1 303-555-0115', 'horizon%s.com'],
            ['Paramount %s Specialists', true, 4.9, 240, '+1 303-555-0116', 'paramount%s.com'],
        ];

        $cleanCategorySlug = preg_replace('/[^a-z0-9]/', '', strtolower($category)) ?: 'pro';
        $places = [];

        // Distribute coordinates in a radial scatter around center
        $count = count($templates);
        $radiusDegrees = ($criteria->radiusKm / 111.0); // 1 degree ~ 111 km

        foreach ($templates as $i => $tpl) {
            [$nameFormat, $hasWeb, $rating, $reviews, $phone, $webFormat] = $tpl;
            $name = sprintf($nameFormat, $category);
            $slug = sprintf($webFormat ?? '', $cleanCategorySlug);
            $website = $hasWeb ? "https://www.{$slug}" : null;

            // Compute pseudo-random spatial offset within radius
            $angle = ($i / $count) * 2 * M_PI + (($i * 17) % 10) * 0.1;
            $dist = (0.2 + 0.75 * (($i * 37) % 100) / 100) * $radiusDegrees;

            $lat = round($center['lat'] + $dist * sin($angle), 6);
            $lng = round($center['lng'] + ($dist * cos($angle)) / cos(deg2rad($center['lat'])), 6);

            $streetNum = 1000 + ($i * 142);
            $address = "{$streetNum} Market St, {$center['city']}, USA";
            $placeId = 'ChIJ' . substr(hash('sha256', "mock_{$name}_{$address}"), 0, 23);

            $places[] = [
                'id' => $placeId,
                'displayName' => [
                    'text' => $name,
                    'languageCode' => 'en',
                ],
                'formattedAddress' => $address,
                'location' => [
                    'latitude' => $lat,
                    'longitude' => $lng,
                ],
                'rating' => $rating,
                'userRatingCount' => $reviews,
                'nationalPhoneNumber' => $phone,
                'websiteUri' => $website,
                'businessStatus' => 'OPERATIONAL',
                'types' => [strtolower(str_replace(' ', '_', $category)), 'point_of_interest', 'establishment'],
            ];
        }

        return $places;
    }
}
