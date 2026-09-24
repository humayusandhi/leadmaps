<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Domain\Usage\Services\CreditEngineService;
use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSufficientCreditsMiddleware
{
    public function __construct(
        private readonly CreditEngineService $creditEngine
    ) {}

    /**
     * Handle an incoming request, blocking execution if the workspace has no available credits.
     *
     * @param Request $request
     * @param Closure(Request): (Response) $next
     * @param int $minCredits
     * @return Response
     */
    public function handle(Request $request, Closure $next, int $minCredits = 1): Response
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        if (! $workspaceId) {
            return $next($request);
        }

        $summary = $this->creditEngine->getBalanceSummary($workspaceId);

        if ($summary['available'] < $minCredits) {
            return ApiResponse::error(
                message: 'Your workspace has depleted its usage credits. Please upgrade your plan or purchase top-up credits.',
                statusCode: 402,
                errors: [
                    'code' => 'INSUFFICIENT_CREDITS',
                    'available_credits' => $summary['available'],
                    'required_credits' => $minCredits,
                    'upgrade_url' => '/billing',
                ]
            );
        }

        return $next($request);
    }
}
