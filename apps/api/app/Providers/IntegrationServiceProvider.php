<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domain\Integration\Contracts\CRMProviderInterface;
use App\Domain\Integration\Providers\MockCRMProvider;
use App\Domain\Integration\Providers\RiffCRMProvider;
use Illuminate\Support\ServiceProvider;

class IntegrationServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(MockCRMProvider::class, function () {
            return new MockCRMProvider();
        });

        $this->app->singleton(RiffCRMProvider::class, function () {
            return new RiffCRMProvider();
        });

        $this->app->bind(CRMProviderInterface::class, function ($app) {
            return $app->make(RiffCRMProvider::class);
        });
    }

    public function boot(): void
    {
        //
    }
}
