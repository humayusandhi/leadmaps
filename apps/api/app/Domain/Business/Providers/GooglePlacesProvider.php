<?php

declare(strict_types=1);

namespace App\Domain\Business\Providers;

use App\Domain\Business\Contracts\BusinessDiscoveryProvider;
use App\Domain\Business\DTOs\DiscoveryCriteria;
use App\Domain\Business\DTOs\DiscoveryResult;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class GooglePlacesProvider implements BusinessDiscoveryProvider
{
    private const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
    private const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.types,places.businessStatus';

    public function __construct(
        private readonly ?string $apiKey = null,
        private readonly int $maxRetries = 2,
    ) {
    }

    public function search(DiscoveryCriteria $criteria): DiscoveryResult
    {
        $key = $this->apiKey ?? (function_exists('config') ? config('services.google.places_key') : null);

        if (empty($key)) {
            throw new RuntimeException('Google Places API key is not configured.');
        }

        $payload = [
            'textQuery' => $criteria->toSearchQuery(),
            'maxResultCount' => 20,
        ];

        // Add circular location bias if coordinates provided
        if ($criteria->latitude !== null && $criteria->longitude !== null) {
            $payload['locationBias'] = [
                'circle' => [
                    'center' => [
                        'latitude' => $criteria->latitude,
                        'longitude' => $criteria->longitude,
                    ],
                    'radius' => (float) ($criteria->radiusKm * 1000), // meters
                ],
            ];
        }

        $attempt = 0;
        $delayMs = 250;

        while ($attempt <= $this->maxRetries) {
            try {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Goog-Api-Key' => $key,
                    'X-Goog-FieldMask' => self::FIELD_MASK,
                ])
                ->timeout(10)
                ->post(self::ENDPOINT, $payload);

                if ($response->successful()) {
                    $json = $response->json();
                    $places = $json['places'] ?? [];

                    return new DiscoveryResult(
                        places: $places,
                        totalCount: count($places),
                        isMock: false,
                        metadata: [
                            'provider' => 'google_places_new',
                            'query' => $criteria->toSearchQuery(),
                        ]
                    );
                }

                $status = $response->status();

                // Retry on rate limit (429) or transient 5xx
                if (in_array($status, [429, 500, 502, 503, 504], true) && $attempt < $this->maxRetries) {
                    $attempt++;
                    usleep($delayMs * 1000);
                    $delayMs *= 2;
                    continue;
                }

                Log::error('Google Places API call failed', [
                    'status' => $status,
                    'body' => $response->body(),
                    'query' => $criteria->toSearchQuery(),
                ]);

                throw new RuntimeException(
                    "Google Places API responded with status {$status}: {$response->body()}"
                );
            } catch (\Exception $e) {
                if ($attempt < $this->maxRetries && ! ($e instanceof RuntimeException)) {
                    $attempt++;
                    usleep($delayMs * 1000);
                    $delayMs *= 2;
                    continue;
                }

                throw new RuntimeException('Google Places Discovery failed: ' . $e->getMessage(), 0, $e);
            }
        }

        throw new RuntimeException('Google Places Discovery failed after maximum retries.');
    }
}
