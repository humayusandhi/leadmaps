<?php

declare(strict_types=1);

namespace Tests\Unit;

require_once __DIR__ . '/../../app/Domain/Business/Contracts/BusinessDiscoveryProvider.php';
require_once __DIR__ . '/../../app/Domain/Business/DTOs/DiscoveryCriteria.php';
require_once __DIR__ . '/../../app/Domain/Business/DTOs/DiscoveryResult.php';
require_once __DIR__ . '/../../app/Domain/Business/Providers/GooglePlacesProvider.php';

use App\Domain\Business\Contracts\BusinessDiscoveryProvider;
use App\Domain\Business\DTOs\DiscoveryCriteria;
use App\Domain\Business\Providers\GooglePlacesProvider;
use RuntimeException;

class GooglePlacesProviderTest
{
    public static function run(): void
    {
        echo "Running GooglePlacesProviderTest...\n";

        // 1. Assert class implements BusinessDiscoveryProvider interface
        $provider = new GooglePlacesProvider(apiKey: 'test-api-key');
        assert($provider instanceof BusinessDiscoveryProvider, 'Must implement BusinessDiscoveryProvider');
        echo "  ✓ GooglePlacesProvider implements BusinessDiscoveryProvider contract.\n";

        // 2. Assert exception thrown if API key is missing
        $providerNoKey = new GooglePlacesProvider(apiKey: null);
        $caught = false;
        try {
            $criteria = new DiscoveryCriteria('Dentists', 'Austin, TX');
            $providerNoKey->search($criteria);
        } catch (RuntimeException $e) {
            $caught = true;
            assert(str_contains($e->getMessage(), 'Google Places API key is not configured'), 'Expected key error message');
        }
        assert($caught, 'Should throw exception when API key missing');
        echo "  ✓ Missing API key throws explicit configuration error.\n";

        echo "GOOGLE PLACES PROVIDER TESTS PASSED GREEN!\n";
    }
}

GooglePlacesProviderTest::run();
