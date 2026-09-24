<?php

declare(strict_types=1);

namespace App\Domain\Business\DTOs;

final class DiscoveryCriteria
{
    public function __construct(
        public readonly string $category,
        public readonly string $location,
        public readonly int $radiusKm = 10,
        public readonly ?bool $hasWebsite = null,
        public readonly ?float $minRating = null,
        public readonly ?int $minReviews = null,
        public readonly ?float $latitude = null,
        public readonly ?float $longitude = null,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            category: (string) ($data['category'] ?? ''),
            location: (string) ($data['location'] ?? ''),
            radiusKm: isset($data['radius_km']) ? (int) $data['radius_km'] : 10,
            hasWebsite: isset($data['has_website']) ? (bool) $data['has_website'] : null,
            minRating: isset($data['min_rating']) ? (float) $data['min_rating'] : null,
            minReviews: isset($data['min_reviews']) ? (int) $data['min_reviews'] : null,
            latitude: isset($data['latitude']) ? (float) $data['latitude'] : null,
            longitude: isset($data['longitude']) ? (float) $data['longitude'] : null,
        );
    }

    public function toSearchQuery(): string
    {
        return trim("{$this->category} in {$this->location}");
    }
}
