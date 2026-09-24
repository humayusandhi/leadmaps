<?php

declare(strict_types=1);

namespace App\Domain\Business\Services;

use App\Domain\Business\Models\Business;
use Illuminate\Support\Facades\DB;

class BusinessNormalizerService
{
    /**
     * Normalize a single raw place payload from Google Places API (New) or Mock Provider.
     *
     * @param array<string, mixed> $raw
     * @param string|null $workspaceId Active workspace ID to check for deduplication/saved status
     * @return array<string, mixed>
     */
    public function normalize(array $raw, ?string $workspaceId = null): array
    {
        $placeId = (string) ($raw['id'] ?? $raw['place_id'] ?? '');

        // Extract business name
        $name = '';
        if (isset($raw['displayName']['text'])) {
            $name = (string) $raw['displayName']['text'];
        } elseif (isset($raw['name'])) {
            $name = (string) $raw['name'];
        }

        // Extract address
        $address = (string) ($raw['formattedAddress'] ?? $raw['formatted_address'] ?? $raw['vicinity'] ?? '');

        // Extract City and Country heuristically from formatted address
        [$city, $country] = $this->extractCityAndCountry($address);

        // Coordinates
        $lat = 0.0;
        $lng = 0.0;
        if (isset($raw['location']['latitude'], $raw['location']['longitude'])) {
            $lat = (float) $raw['location']['latitude'];
            $lng = (float) $raw['location']['longitude'];
        } elseif (isset($raw['geometry']['location']['lat'], $raw['geometry']['location']['lng'])) {
            $lat = (float) $raw['geometry']['location']['lat'];
            $lng = (float) $raw['geometry']['location']['lng'];
        }

        // Contact info
        $phone = $raw['nationalPhoneNumber'] ?? $raw['formatted_phone_number'] ?? $raw['internationalPhoneNumber'] ?? null;
        $website = $raw['websiteUri'] ?? $raw['website'] ?? null;

        // Ratings
        $rating = isset($raw['rating']) ? (float) $raw['rating'] : null;
        $reviewCount = isset($raw['userRatingCount']) ? (int) $raw['userRatingCount'] : (int) ($raw['user_ratings_total'] ?? 0);

        // Check if saved in active workspace
        $isSaved = false;
        if ($workspaceId && ! empty($placeId)) {
            $isSaved = $this->isPlaceSavedInWorkspace($placeId, $workspaceId);
        }

        return [
            'google_place_id' => $placeId,
            'name' => $name,
            'formatted_address' => $address,
            'city' => $city,
            'country' => $country,
            'phone_number' => $phone ? (string) $phone : null,
            'website_url' => $website ? (string) $website : null,
            'rating' => $rating,
            'review_count' => $reviewCount,
            'latitude' => $lat,
            'longitude' => $lng,
            'is_saved' => $isSaved,
            'raw_provider_payload' => $raw,
        ];
    }

    /**
     * Batch normalize places.
     *
     * @param array<int, array<string, mixed>> $places
     * @param string|null $workspaceId
     * @return array<int, array<string, mixed>>
     */
    public function normalizeBatch(array $places, ?string $workspaceId = null): array
    {
        return array_map(
            fn (array $place) => $this->normalize($place, $workspaceId),
            $places
        );
    }

    /**
     * Check whether a place ID is already saved as a lead or business in the workspace.
     */
    public function isPlaceSavedInWorkspace(string $googlePlaceId, string $workspaceId): bool
    {
        // Check if business exists and is associated with a saved lead or workspace search
        $exists = DB::table('businesses')
            ->where('google_place_id', $googlePlaceId)
            ->exists();

        // In Phase 4 leads table will track workspace-saved items; for now we check business presence
        return $exists;
    }

    /**
     * Extract city and country from standard address strings.
     *
     * @param string $address
     * @return array{0: string, 1: string}
     */
    private function extractCityAndCountry(string $address): array
    {
        $parts = array_map('trim', explode(',', $address));
        $count = count($parts);

        if ($count >= 3) {
            $country = $parts[$count - 1];
            $city = $parts[$count - 2];
            return [$city, $country];
        }

        if ($count === 2) {
            return [$parts[0], $parts[1]];
        }

        return [$address ?: 'Unknown', 'USA'];
    }
}
