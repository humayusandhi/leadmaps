<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Sentry DSN
    |--------------------------------------------------------------------------
    |
    | The Data Source Name (DSN) tells Sentry where to send events.
    |
    */

    'dsn' => env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN')),

    /*
    |--------------------------------------------------------------------------
    | Release & Environment
    |--------------------------------------------------------------------------
    |
    | Configures deployment version tracking and environment tagging.
    |
    */

    'environment' => env('APP_ENV', 'production'),

    'release' => env('SENTRY_RELEASE', 'leadmap-ai-api@1.0.0'),

    /*
    |--------------------------------------------------------------------------
    | Performance Monitoring & Tracing
    |--------------------------------------------------------------------------
    |
    | Sample rates for distributed traces and profiling.
    |
    */

    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.2),

    'profiles_sample_rate' => (float) env('SENTRY_PROFILES_SAMPLE_RATE', 0.1),

    /*
    |--------------------------------------------------------------------------
    | Data Privacy & PII Scrubbing
    |--------------------------------------------------------------------------
    |
    | Disable default PII sending to prevent sensitive customer data leakage.
    |
    */

    'send_default_pii' => false,

    'controllers_base_namespace' => 'App\\Http\\Controllers',

    'ignore_exceptions' => [
        \Illuminate\Validation\ValidationException::class,
        \Illuminate\Auth\AuthenticationException::class,
        \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
        \Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException::class,
    ],

];
