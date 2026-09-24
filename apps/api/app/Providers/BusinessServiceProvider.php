<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domain\Business\Contracts\BusinessDiscoveryProvider;
use App\Domain\Business\Providers\GooglePlacesProvider;
use App\Domain\Business\Providers\MockBusinessDiscoveryProvider;
use App\Domain\Business\Services\BusinessNormalizerService;
use Illuminate\Support\ServiceProvider;

class BusinessServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(BusinessNormalizerService::class, function () {
            return new BusinessNormalizerService();
        });

        $this->app->bind(BusinessDiscoveryProvider::class, function ($app) {
            $apiKey = config('services.google.places_key');

            if (! empty($apiKey)) {
                return new GooglePlacesProvider(apiKey: $apiKey);
            }

            return new MockBusinessDiscoveryProvider();
        });
    }

    public function boot(): void
    {
        //
    }
}
