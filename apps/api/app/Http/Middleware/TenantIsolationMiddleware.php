<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Domain\Workspace\Models\Workspace;
use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantIsolationMiddleware
{
    /**
     * Handle an incoming request and enforce workspace membership.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $workspaceId = $request->header('X-Workspace-ID');

        if (! $workspaceId) {
            return ApiResponse::error(
                message: 'Missing mandatory X-Workspace-ID header.',
                statusCode: 400
            );
        }

        $user = $request->user();

        if (! $user) {
            return ApiResponse::error(
                message: 'Unauthenticated tenant request.',
                statusCode: 401
            );
        }

        // Find active workspace membership for user
        $membership = $user->workspaceMemberships()
            ->where('workspace_id', $workspaceId)
            ->first();

        if (! $membership) {
            return ApiResponse::error(
                message: 'Access denied: You are not a member of the requested workspace.',
                statusCode: 403
            );
        }

        $workspace = Workspace::find($workspaceId);

        if (! $workspace) {
            return ApiResponse::error(
                message: 'Workspace not found.',
                statusCode: 404
            );
        }

        // Bind active workspace context to application container
        app()->instance('current_workspace', $workspace);
        app()->instance('current_workspace_id', $workspaceId);
        app()->instance('current_workspace_role', $membership->role);

        $request->attributes->set('workspace', $workspace);
        $request->attributes->set('workspace_role', $membership->role);

        return $next($request);
    }
}
