<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domain\AI\Contracts\AIProviderInterface;
use App\Domain\AI\Providers\MockAIProvider;
use App\Domain\AI\Providers\OpenAIProvider;
use App\Domain\AI\Services\AIOpportunitySchemaValidator;
use Illuminate\Support\ServiceProvider;

class AiServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AIOpportunitySchemaValidator::class, function () {
            return new AIOpportunitySchemaValidator();
        });

        $this->app->singleton(MockAIProvider::class, function () {
            return new MockAIProvider();
        });

        $this->app->bind(AIProviderInterface::class, function ($app) {
            $apiKey = config('services.openai.api_key') ?: config('services.openai.key');

            if (! empty($apiKey)) {
                return new OpenAIProvider(
                    validator: $app->make(AIOpportunitySchemaValidator::class),
                    fallbackProvider: $app->make(MockAIProvider::class)
                );
            }

            return $app->make(MockAIProvider::class);
        });
    }

    public function boot(): void
    {
        //
    }
}
