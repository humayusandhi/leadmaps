<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Business\Models\Search;
use App\Domain\Workspace\Models\Workspace;
use App\Http\Requests\V1\Search\ExecuteSearchRequest;
use App\Jobs\DiscoverBusinessesJob;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SearchController extends Controller
{
    /**
     * List past discovery searches executed within the active workspace.
     */
    public function index(Request $request): JsonResponse
    {
        $searches = Search::latest()
            ->paginate(15);

        return ApiResponse::success(
            data: $searches->items(),
            meta: [
                'pagination' => [
                    'current_page' => $searches->currentPage(),
                    'per_page' => $searches->perPage(),
                    'total' => $searches->total(),
                    'last_page' => $searches->lastPage(),
                ],
            ]
        );
    }

    /**
     * Initiate a new local business discovery search.
     */
    public function store(ExecuteSearchRequest $request): JsonResponse
    {
        $workspace = app('current_workspace');
        if (! $workspace instanceof Workspace) {
            $workspace = Workspace::find(app('current_workspace_id'));
        }

        if (! $workspace || $workspace->credit_balance < 1) {
            return ApiResponse::error(
                message: 'Insufficient workspace credits. Each discovery search requires 1 credit.',
                statusCode: 402,
                errors: ['credits' => 'Credit balance exhausted. Please upgrade plan or purchase credits.']
            );
        }

        $validated = $request->validated();
        $user = $request->user();

        // Build filter metadata
        $filters = array_filter([
            'has_website' => $request->has('has_website') ? $request->boolean('has_website') : null,
            'min_rating' => $request->filled('min_rating') ? (float) $request->input('min_rating') : null,
            'min_reviews' => $request->filled('min_reviews') ? (int) $request->input('min_reviews') : null,
        ], fn ($val) => $val !== null);

        // Record Search entity in PENDING state
        $search = Search::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'query' => trim("{$validated['category']} in {$validated['location']}"),
            'category' => $validated['category'],
            'location' => $validated['location'],
            'radius_km' => $validated['radius_km'],
            'status' => 'PENDING',
            'total_results' => 0,
            'filters' => $filters,
        ]);

        $isSync = $request->boolean('sync', true);

        if ($isSync) {
            // Execute inline discovery job for immediate UI response
            try {
                app()->call([new DiscoverBusinessesJob($search->id, $workspace->id), 'handle']);
                $search->refresh()->load('businesses');
            } catch (\Exception $e) {
                return ApiResponse::error(
                    message: 'Discovery service encountered an issue: ' . $e->getMessage(),
                    statusCode: 500
                );
            }
        } else {
            // Queue asynchronous job
            DiscoverBusinessesJob::dispatch($search->id, $workspace->id);
        }

        return ApiResponse::success(
            data: [
                'search' => $search,
                'businesses' => $search->businesses ?? [],
            ],
            message: 'Discovery search executed successfully.',
            statusCode: 201
        );
    }

    /**
     * Fetch details and discovered businesses for a specific search.
     */
    public function show(string $id): JsonResponse
    {
        $search = Search::with('businesses')->find($id);

        if (! $search) {
            return ApiResponse::error(
                message: 'Search record not found.',
                statusCode: 404
            );
        }

        return ApiResponse::success(
            data: [
                'search' => $search,
                'businesses' => $search->businesses,
            ]
        );
    }
}
