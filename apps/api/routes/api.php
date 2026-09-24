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

Route::prefix('v1')
    ->middleware([\App\Http\Middleware\RequestCorrelationMiddleware::class])
    ->group(function () {
    // System Health Endpoints
    Route::get('/health', HealthController::class)->name('api.v1.health');
    Route::get('/health/sentry-test', [HealthController::class, 'sentryTest'])->name('api.v1.health.sentry-test');

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

    // Search Domain (Phase 3)
    Route::prefix('searches')
        ->middleware(['auth:sanctum', \App\Http\Middleware\TenantIsolationMiddleware::class])
        ->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\SearchController::class, 'index'])->name('api.v1.searches.index');
            Route::post('/', [\App\Http\Controllers\Api\V1\SearchController::class, 'store'])->name('api.v1.searches.store');
            Route::get('/{id}', [\App\Http\Controllers\Api\V1\SearchController::class, 'show'])->name('api.v1.searches.show');
        });

    // Lead Domain (Phase 4)
    Route::prefix('leads')
        ->middleware(['auth:sanctum', \App\Http\Middleware\TenantIsolationMiddleware::class])
        ->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\LeadController::class, 'index'])->name('api.v1.leads.index');
            Route::post('/', [\App\Http\Controllers\Api\V1\LeadController::class, 'store'])->name('api.v1.leads.store');
            Route::get('/{id}', [\App\Http\Controllers\Api\V1\LeadController::class, 'show'])->name('api.v1.leads.show');
            Route::patch('/{id}/status', [\App\Http\Controllers\Api\V1\LeadController::class, 'updateStatus'])->name('api.v1.leads.status');
            Route::post('/{id}/notes', [\App\Http\Controllers\Api\V1\LeadController::class, 'addNote'])->name('api.v1.leads.notes.store');
            Route::post('/{id}/tags', [\App\Http\Controllers\Api\V1\LeadController::class, 'attachTag'])->name('api.v1.leads.tags.attach');
            Route::delete('/{id}/tags/{tagId}', [\App\Http\Controllers\Api\V1\LeadController::class, 'detachTag'])->name('api.v1.leads.tags.detach');
            Route::patch('/{id}/assign', [\App\Http\Controllers\Api\V1\LeadController::class, 'assign'])->name('api.v1.leads.assign');
            Route::delete('/{id}', [\App\Http\Controllers\Api\V1\LeadController::class, 'destroy'])->name('api.v1.leads.destroy');
            Route::post('/{id}/analyze', [\App\Http\Controllers\Api\V1\AnalysisController::class, 'analyzeLead'])->name('api.v1.leads.analyze');
            Route::get('/{id}/analysis', [\App\Http\Controllers\Api\V1\AnalysisController::class, 'showByLead'])->name('api.v1.leads.analysis');
            Route::post('/{id}/opportunities', [\App\Http\Controllers\Api\V1\OpportunityController::class, 'generate'])->name('api.v1.leads.opportunities.generate');
            Route::get('/{id}/opportunities', [\App\Http\Controllers\Api\V1\OpportunityController::class, 'index'])->name('api.v1.leads.opportunities.index');
            Route::post('/{id}/outreach', [\App\Http\Controllers\Api\V1\OutreachController::class, 'generate'])->name('api.v1.leads.outreach.generate');
            Route::get('/{id}/outreach', [\App\Http\Controllers\Api\V1\OutreachController::class, 'index'])->name('api.v1.leads.outreach.index');
        });

    // Outreach Domain (Phase 7)
    Route::prefix('outreach')
        ->middleware(['auth:sanctum', \App\Http\Middleware\TenantIsolationMiddleware::class])
        ->group(function () {
            Route::patch('/{id}', [\App\Http\Controllers\Api\V1\OutreachController::class, 'update'])->name('api.v1.outreach.update');
        });

    // Analysis Domain (Phase 5 & 6)
    Route::prefix('analyses')
        ->middleware(['auth:sanctum', \App\Http\Middleware\TenantIsolationMiddleware::class])
        ->group(function () {
            Route::get('/{id}', [\App\Http\Controllers\Api\V1\AnalysisController::class, 'show'])->name('api.v1.analyses.show');
        });

    // Custom Lists Domain (Phase 7)
    Route::prefix('lists')
        ->middleware(['auth:sanctum', \App\Http\Middleware\TenantIsolationMiddleware::class])
        ->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\LeadListController::class, 'index'])->name('api.v1.lists.index');
            Route::post('/', [\App\Http\Controllers\Api\V1\LeadListController::class, 'store'])->name('api.v1.lists.store');
            Route::get('/{id}', [\App\Http\Controllers\Api\V1\LeadListController::class, 'show'])->name('api.v1.lists.show');
            Route::patch('/{id}', [\App\Http\Controllers\Api\V1\LeadListController::class, 'update'])->name('api.v1.lists.update');
            Route::delete('/{id}', [\App\Http\Controllers\Api\V1\LeadListController::class, 'destroy'])->name('api.v1.lists.destroy');
            Route::post('/{id}/leads', [\App\Http\Controllers\Api\V1\LeadListController::class, 'addLeads'])->name('api.v1.lists.leads.add');
            Route::delete('/{id}/leads/{leadId}', [\App\Http\Controllers\Api\V1\LeadListController::class, 'removeLead'])->name('api.v1.lists.leads.remove');
        });

    // Export Domain (Phase 7)
    Route::prefix('exports')
        ->middleware(['auth:sanctum', \App\Http\Middleware\TenantIsolationMiddleware::class])
        ->group(function () {
            Route::post('/leads', [\App\Http\Controllers\Api\V1\ExportController::class, 'store'])->name('api.v1.exports.leads');
            Route::get('/{id}/status', [\App\Http\Controllers\Api\V1\ExportController::class, 'status'])->name('api.v1.exports.status');
            Route::get('/{id}/download', [\App\Http\Controllers\Api\V1\ExportController::class, 'download'])->name('api.v1.exports.download');
        });

    // Billing Domain (Phase 8)
    Route::post('/billing/webhooks/razorpay', [\App\Http\Controllers\Api\V1\RazorpayWebhookController::class, 'handle'])
        ->name('api.v1.billing.webhooks.razorpay');

    Route::prefix('billing')
        ->middleware(['auth:sanctum', \App\Http\Middleware\TenantIsolationMiddleware::class])
        ->group(function () {
            Route::get('/balance', [\App\Http\Controllers\Api\V1\BillingController::class, 'balance'])->name('api.v1.billing.balance');
            Route::get('/plans', [\App\Http\Controllers\Api\V1\BillingController::class, 'plans'])->name('api.v1.billing.plans');
            Route::post('/checkout', [\App\Http\Controllers\Api\V1\BillingController::class, 'checkout'])->name('api.v1.billing.checkout');
            Route::get('/transactions', [\App\Http\Controllers\Api\V1\BillingController::class, 'transactions'])->name('api.v1.billing.transactions');
            Route::post('/topup', [\App\Http\Controllers\Api\V1\BillingController::class, 'topup'])->name('api.v1.billing.topup');
            Route::post('/cancel', [\App\Http\Controllers\Api\V1\BillingController::class, 'cancel'])->name('api.v1.billing.cancel');
        });

    // Integrations Domain (Phase 9)
    Route::prefix('integrations')
        ->middleware(['auth:sanctum', \App\Http\Middleware\TenantIsolationMiddleware::class])
        ->group(function () {
            Route::get('/', [\App\Http\Controllers\Api\V1\IntegrationController::class, 'index'])->name('api.v1.integrations.index');
            Route::post('/connect', [\App\Http\Controllers\Api\V1\IntegrationController::class, 'connect'])->name('api.v1.integrations.connect');
            Route::post('/{id}/test', [\App\Http\Controllers\Api\V1\IntegrationController::class, 'test'])->name('api.v1.integrations.test');
            Route::delete('/{id}', [\App\Http\Controllers\Api\V1\IntegrationController::class, 'disconnect'])->name('api.v1.integrations.disconnect');
            Route::post('/{id}/sync-lead', [\App\Http\Controllers\Api\V1\IntegrationController::class, 'syncLead'])->name('api.v1.integrations.sync-lead');
            Route::get('/{id}/logs', [\App\Http\Controllers\Api\V1\IntegrationController::class, 'logs'])->name('api.v1.integrations.logs');
        });
});
