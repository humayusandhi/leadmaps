<?php

declare(strict_types=1);

namespace App\Domain\Business\DTOs;

final class DiscoveryResult
{
    /**
     * @param array<int, array<string, mixed>> $places Raw place objects returned by provider
     * @param array<string, mixed> $metadata Additional provider metadata
     */
    public function __construct(
        public readonly array $places,
        public readonly int $totalCount,
        public readonly bool $isMock = false,
        public readonly array $metadata = [],
    ) {
    }

    public static function empty(): self
    {
        return new self(places: [], totalCount: 0, isMock: false, metadata: []);
    }
}
