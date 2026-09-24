<?php

declare(strict_types=1);

namespace App\Providers;

use App\Domain\Billing\Contracts\PaymentProviderInterface;
use App\Domain\Billing\Providers\MockPaymentProvider;
use App\Domain\Billing\Providers\RazorpayProvider;
use Illuminate\Support\ServiceProvider;

class BillingServiceProvider extends ServiceProvider
{
    /**
     * Register billing and payment services.
     */
    public function register(): void
    {
        $this->app->singleton(PaymentProviderInterface::class, function () {
            if (config('services.razorpay.mock', true)) {
                return new MockPaymentProvider();
            }

            return new RazorpayProvider(
                keyId: config('services.razorpay.key_id', 'rzp_test_leadmap_sandbox'),
                keySecret: config('services.razorpay.key_secret', 'rzp_sec_leadmap_sandbox'),
                webhookSecret: config('services.razorpay.webhook_secret', 'whsec_leadmap_hmac_secret')
            );
        });
    }
}
