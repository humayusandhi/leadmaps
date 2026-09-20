<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\HealthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — LeadMap AI
|--------------------------------------------------------------------------
| All endpoints are versioned under /api/v1/
*/

Route::prefix('v1')->group(function () {
    // System Health Endpoint
    Route::get('/health', HealthController::class)->name('api.v1.health');

    // Authentication Domain
    Route::prefix('auth')->group(function () {
        Route::post('/register', [\App\Http\Controllers\Api\V1\AuthController::class, 'register'])->name('api.v1.auth.register');
        Route::post('/login', [\App\Http\Controllers\Api\V1\AuthController::class, 'login'])->name('api.v1.auth.login');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [\App\Http\Controllers\Api\V1\AuthController::class, 'me'])->name('api.v1.auth.me');
            Route::post('/logout', [\App\Http\Controllers\Api\V1\AuthController::class, 'logout'])->name('api.v1.auth.logout');
        });
    });

    // Workspace Domain Placeholder
    Route::prefix('workspaces')->group(function () {
        // Defined in Phase 2
    });

    // Search Domain Placeholder
    Route::prefix('searches')->group(function () {
        // Defined in Phase 3
    });

    // Lead Domain Placeholder
    Route::prefix('leads')->group(function () {
        // Defined in Phase 4
    });

    // Analysis Domain Placeholder
    Route::prefix('analyses')->group(function () {
        // Defined in Phase 5 & 6
    });

    // Lists Domain Placeholder
    Route::prefix('lists')->group(function () {
        // Defined in Phase 7
    });

    // Billing Domain Placeholder
    Route::prefix('billing')->group(function () {
        // Defined in Phase 8
    });

    // Integrations Domain Placeholder
    Route::prefix('integrations')->group(function () {
        // Defined in Phase 9
    });
});
