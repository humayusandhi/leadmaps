<?php

declare(strict_types=1);

namespace App\Domain\WebsiteAnalysis\DTOs;

readonly class SafeFetchResult
{
    /**
     * @param array<string, array<int, string>> $headers
     */
    public function __construct(
        public string $originalUrl,
        public string $finalUrl,
        public int $httpStatus,
        public int $loadTimeMs,
        public bool $isSslActive,
        public string $html,
        public array $headers = []
    ) {
    }
}
