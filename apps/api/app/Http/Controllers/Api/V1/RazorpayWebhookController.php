<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Billing\Contracts\PaymentProviderInterface;
use App\Jobs\ProcessSubscriptionWebhookJob;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RazorpayWebhookController extends Controller
{
    public function handle(Request $request, PaymentProviderInterface $provider): JsonResponse
    {
        $signature = $request->header('X-Razorpay-Signature');
        $rawPayload = $request->getContent();
        $secret = config('services.razorpay.webhook_secret', 'whsec_leadmap_hmac_secret');

        // 1. Verify HMAC-SHA256 Signature
        if (! $signature || ! $provider->verifyWebhookSignature($rawPayload, $signature, $secret)) {
            Log::warning('Razorpay webhook signature verification failed.');

            return ApiResponse::error(
                message: 'Invalid webhook signature.',
                statusCode: 400
            );
        }

        $payload = $request->json()->all();
        $eventId = $payload['event_id'] ?? ($payload['id'] ?? md5($rawPayload));

        // 2. Idempotency check (prevent duplicate execution on retry)
        $cacheKey = "razorpay_webhook_{$eventId}";
        if (Cache::has($cacheKey)) {
            Log::info("Duplicate Razorpay webhook event skipped: [{$eventId}]");

            return ApiResponse::success(
                data: ['event_id' => $eventId, 'status' => 'duplicate_skipped'],
                message: 'Event already processed.'
            );
        }

        Cache::put($cacheKey, true, now()->addHours(24));

        // 3. Dispatch background processor job
        ProcessSubscriptionWebhookJob::dispatch($payload);

        return ApiResponse::success(
            data: ['event_id' => $eventId, 'status' => 'queued'],
            message: 'Webhook processed successfully.'
        );
    }
}
