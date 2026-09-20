<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Auth\Models\User;
use App\Domain\Workspace\Enums\WorkspaceRole;
use App\Domain\Workspace\Models\Workspace;
use App\Domain\Workspace\Models\WorkspaceMember;
use App\Http\Requests\V1\Auth\LoginRequest;
use App\Http\Requests\V1\Auth\RegisterRequest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new user and provision their default workspace.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $result = DB::transaction(function () use ($validated) {
            // 1. Create User
            $user = User::create([
                'name' => $validated['name'],
                'email' => strtolower($validated['email']),
                'password' => Hash::make($validated['password']),
            ]);

            // 2. Provision Default Personal Workspace
            $workspaceName = $validated['workspace_name'] ?? ($validated['name'] . "'s Workspace");
            $workspaceSlug = Str::slug($workspaceName) . '-' . Str::lower(Str::random(6));

            $workspace = Workspace::create([
                'name' => $workspaceName,
                'slug' => $workspaceSlug,
                'tier' => 'FREE',
                'credit_balance' => 25, // Initial welcome bonus credits
            ]);

            // 3. Assign User as OWNER
            WorkspaceMember::create([
                'workspace_id' => $workspace->id,
                'user_id' => $user->id,
                'role' => WorkspaceRole::OWNER,
            ]);

            $token = $user->createToken('leadmap_auth_token')->plainTextToken;

            return [
                'user' => $user,
                'workspace' => $workspace,
                'token' => $token,
            ];
        });

        return ApiResponse::success(
            data: [
                'user' => [
                    'id' => $result['user']->id,
                    'name' => $result['user']->name,
                    'email' => $result['user']->email,
                ],
                'workspace' => [
                    'id' => $result['workspace']->id,
                    'name' => $result['workspace']->name,
                    'slug' => $result['workspace']->slug,
                    'tier' => $result['workspace']->tier,
                    'credit_balance' => $result['workspace']->credit_balance,
                    'role' => WorkspaceRole::OWNER->value,
                ],
                'token' => $result['token'],
            ],
            message: 'User registered successfully with default workspace.',
            statusCode: 201
        );
    }

    /**
     * Authenticate existing user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', strtolower($validated['email']))->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return ApiResponse::error(
                message: 'Invalid email or password.',
                statusCode: 401
            );
        }

        $token = $user->createToken('leadmap_auth_token')->plainTextToken;
        $workspaces = $user->workspaces()->get(['workspaces.id', 'workspaces.name', 'workspaces.slug', 'workspaces.tier', 'workspaces.credit_balance']);

        return ApiResponse::success(
            data: [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'workspaces' => $workspaces->map(fn ($w) => [
                    'id' => $w->id,
                    'name' => $w->name,
                    'slug' => $w->slug,
                    'tier' => $w->tier,
                    'credit_balance' => $w->credit_balance,
                    'role' => $w->pivot->role,
                ]),
                'token' => $token,
            ],
            message: 'Authenticated successfully.'
        );
    }

    /**
     * Get current user profile and workspaces.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return ApiResponse::error('Unauthenticated.', 401);
        }

        $workspaces = $user->workspaces()->get(['workspaces.id', 'workspaces.name', 'workspaces.slug', 'workspaces.tier', 'workspaces.credit_balance']);

        return ApiResponse::success(
            data: [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'workspaces' => $workspaces->map(fn ($w) => [
                    'id' => $w->id,
                    'name' => $w->name,
                    'slug' => $w->slug,
                    'tier' => $w->tier,
                    'credit_balance' => $w->credit_balance,
                    'role' => $w->pivot->role,
                ]),
            ]
        );
    }

    /**
     * Log out and revoke current authentication token.
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user && $user->currentAccessToken()) {
            $user->currentAccessToken()->delete();
        }

        return ApiResponse::success(message: 'Logged out successfully.');
    }
}
