<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    /**
     * Generate a standardized success JSON response.
     */
    public static function success(
        mixed $data = null,
        ?string $message = null,
        int $statusCode = 200,
        array $meta = []
    ): JsonResponse {
        $requestId = request()->header('X-Request-ID') ?? bin2hex(random_bytes(16));

        $payload = [
            'success' => true,
            'data' => $data,
            'message' => $message,
            'meta' => array_merge([
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ], $meta),
        ];

        return response()->json($payload, $statusCode)
            ->header('X-Request-ID', $requestId);
    }

    /**
     * Generate a standardized error JSON response.
     */
    public static function error(
        string $message,
        int $statusCode = 400,
        array $errors = [],
        array $meta = []
    ): JsonResponse {
        $requestId = request()->header('X-Request-ID') ?? bin2hex(random_bytes(16));

        $payload = [
            'success' => false,
            'data' => null,
            'message' => $message,
            'errors' => $errors,
            'meta' => array_merge([
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ], $meta),
        ];

        return response()->json($payload, $statusCode)
            ->header('X-Request-ID', $requestId);
    }
}
