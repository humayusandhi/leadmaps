<?php

declare(strict_types=1);

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Horizon Domain & Path
    |--------------------------------------------------------------------------
    | The prefix and domain for Horizon dashboard access.
    */

    'domain' => env('HORIZON_DOMAIN'),
    'path' => env('HORIZON_PATH', 'horizon'),

    /*
    |--------------------------------------------------------------------------
    | Horizon Redis Connection
    |--------------------------------------------------------------------------
    */

    'use' => 'default',
    'prefix' => env('HORIZON_PREFIX', 'leadmap_horizon:'),

    /*
    |--------------------------------------------------------------------------
    | Queue Worker Environments & Dedicated Pools
    |--------------------------------------------------------------------------
    | Per docs/ARCHITECTURE.md: Isolated worker pools prevent slow crawler
    | or AI inference tasks from blocking fast transactional jobs.
    */

    'environments' => [
        'production' => [
            'supervisor-search' => [
                'connection' => 'redis',
                'queue' => ['search'],
                'balance' => 'simple',
                'maxProcesses' => 10,
                'maxTime' => 30,
                'maxJobs' => 1000,
                'memory' => 128,
                'tries' => 2,
                'timeout' => 30,
                'nice' => 0,
            ],
            'supervisor-website-analysis' => [
                'connection' => 'redis',
                'queue' => ['website-analysis'],
                'balance' => 'simple',
                'maxProcesses' => 20,
                'maxTime' => 20,
                'maxJobs' => 500,
                'memory' => 256,
                'tries' => 1,
                'timeout' => 20,
                'nice' => 0,
            ],
            'supervisor-ai' => [
                'connection' => 'redis',
                'queue' => ['ai'],
                'balance' => 'simple',
                'maxProcesses' => 15,
                'maxTime' => 30,
                'maxJobs' => 500,
                'memory' => 256,
                'tries' => 2,
                'timeout' => 35,
                'nice' => 0,
            ],
            'supervisor-integrations' => [
                'connection' => 'redis',
                'queue' => ['integrations', 'exports', 'default'],
                'balance' => 'auto',
                'maxProcesses' => 10,
                'maxTime' => 60,
                'maxJobs' => 1000,
                'memory' => 256,
                'tries' => 3,
                'timeout' => 120,
                'nice' => 0,
            ],
        ],

        'local' => [
            'supervisor-local' => [
                'connection' => 'redis',
                'queue' => ['default', 'search', 'website-analysis', 'ai', 'integrations', 'exports'],
                'balance' => 'auto',
                'autoScalingStrategy' => 'time',
                'maxProcesses' => 5,
                'maxTime' => 0,
                'maxJobs' => 0,
                'memory' => 128,
                'tries' => 2,
                'timeout' => 60,
                'nice' => 0,
            ],
        ],
    ],

];
