<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

class HealthController extends Controller
{
    /**
     * Check application health, database connectivity, and Redis connectivity.
     */
    public function __invoke(): JsonResponse
    {
        $status = 'healthy';
        $services = [
            'database' => 'ok',
            'redis' => 'ok',
        ];

        try {
            DB::connection()->getPdo();
        } catch (Throwable $e) {
            $services['database'] = 'unreachable';
            $status = 'degraded';
        }

        try {
            Redis::connection()->ping();
        } catch (Throwable $e) {
            $services['redis'] = 'unreachable';
            $status = 'degraded';
        }

        return ApiResponse::success(
            data: [
                'status' => $status,
                'services' => $services,
                'version' => '1.0.0',
                'environment' => config('app.env', 'production'),
            ],
            message: 'LeadMap AI API is operational.'
        );
    }

    /**
     * Diagnostic endpoint to verify Sentry error tracking configuration.
     */
    public function sentryTest(): JsonResponse
    {
        $configured = !empty(config('sentry.dsn'));

        return ApiResponse::success([
            'sentry_configured' => $configured,
            'environment' => config('sentry.environment', 'production'),
            'release' => config('sentry.release', 'leadmap-ai-api@1.0.0'),
            'traces_sample_rate' => config('sentry.traces_sample_rate', 0.2),
            'status' => 'Sentry integration handler operational',
        ], 'Sentry diagnostics check completed.');
    }
}

