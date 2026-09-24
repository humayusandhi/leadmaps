<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestCorrelationMiddleware
{
    /**
     * Handle an incoming request and ensure X-Request-ID correlation.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Extract existing or generate unique UUIDv4 correlation ID
        $requestId = $request->header('X-Request-ID');
        if (empty($requestId)) {
            $requestId = (string) Str::uuid();
            $request->headers->set('X-Request-ID', $requestId);
        }

        // Bind into application container for logger and jobs
        app()->instance('current_request_id', $requestId);

        /** @var Response $response */
        $response = $next($request);

        // Echo back correlation header in response
        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
