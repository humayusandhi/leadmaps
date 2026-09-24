<?php

declare(strict_types=1);

namespace App\Domain\Business\Contracts;

use App\Domain\Business\DTOs\DiscoveryCriteria;
use App\Domain\Business\DTOs\DiscoveryResult;

interface BusinessDiscoveryProvider
{
    /**
     * Search for local businesses satisfying the provided geographic and category criteria.
     * Must adhere strictly to zero web scraping rules.
     *
     * @param DiscoveryCriteria $criteria
     * @return DiscoveryResult
     * @throws \RuntimeException on upstream API or network failure
     */
    public function search(DiscoveryCriteria $criteria): DiscoveryResult;
}
