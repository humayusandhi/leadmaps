<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Lead\Models\Lead;
use App\Domain\Lead\Models\LeadList;
use App\Domain\Lead\Models\LeadListItem;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class LeadListController extends Controller
{
    /**
     * List all lead lists in the active tenant workspace.
     */
    public function index(Request $request): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $lists = LeadList::where('workspace_id', $workspaceId)
            ->withCount('leads')
            ->orderBy('created_at', 'desc')
            ->get();

        return ApiResponse::success(data: $lists);
    }

    /**
     * Create a new custom lead list.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|max:32',
            'icon' => 'nullable|string|max:32',
        ]);

        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $list = LeadList::create([
            'id' => (string) Str::uuid(),
            'workspace_id' => $workspaceId,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? '#10B981',
            'icon' => $validated['icon'] ?? 'folder',
        ]);

        $list->leads_count = 0;

        return ApiResponse::success(
            data: $list,
            message: 'Lead list created successfully.',
            statusCode: 201
        );
    }

    /**
     * Show a specific list with its leads.
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $list = LeadList::where('workspace_id', $workspaceId)
            ->withCount('leads')
            ->find($id);

        if (! $list) {
            return ApiResponse::error(
                message: 'Lead list not found in this workspace.',
                statusCode: 404
            );
        }

        $leads = $list->leads()
            ->with(['business', 'websiteAnalysis', 'aiOpportunities'])
            ->paginate($request->integer('per_page', 25));

        return ApiResponse::success(data: [
            'list' => $list,
            'leads' => $leads,
        ]);
    }

    /**
     * Update list metadata.
     */
    public function update(string $id, Request $request): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $list = LeadList::where('workspace_id', $workspaceId)->find($id);

        if (! $list) {
            return ApiResponse::error(
                message: 'Lead list not found in this workspace.',
                statusCode: 404
            );
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'nullable|string|max:32',
            'icon' => 'nullable|string|max:32',
        ]);

        $list->update($validated);
        $list->loadCount('leads');

        return ApiResponse::success(
            data: $list,
            message: 'Lead list updated successfully.'
        );
    }

    /**
     * Delete a list.
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $list = LeadList::where('workspace_id', $workspaceId)->find($id);

        if (! $list) {
            return ApiResponse::error(
                message: 'Lead list not found in this workspace.',
                statusCode: 404
            );
        }

        $list->delete();

        return ApiResponse::success(
            message: 'Lead list deleted successfully.'
        );
    }

    /**
     * Add lead(s) to a custom list in bulk.
     */
    public function addLeads(string $id, Request $request): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $list = LeadList::where('workspace_id', $workspaceId)->find($id);

        if (! $list) {
            return ApiResponse::error(
                message: 'Lead list not found in this workspace.',
                statusCode: 404
            );
        }

        $validated = $request->validate([
            'lead_ids' => 'required|array|min:1',
            'lead_ids.*' => 'required|uuid',
        ]);

        $userId = auth()->id();
        $addedCount = 0;

        foreach ($validated['lead_ids'] as $leadId) {
            // Verify lead belongs to the same workspace
            $leadExists = Lead::where('workspace_id', $workspaceId)->where('id', $leadId)->exists();
            if ($leadExists) {
                $item = LeadListItem::firstOrCreate(
                    [
                        'lead_list_id' => $list->id,
                        'lead_id' => $leadId,
                    ],
                    [
                        'id' => (string) Str::uuid(),
                        'added_by_user_id' => $userId,
                    ]
                );

                if ($item->wasRecentlyCreated) {
                    $addedCount++;
                }
            }
        }

        $list->loadCount('leads');

        return ApiResponse::success(
            data: [
                'added_count' => $addedCount,
                'total_leads' => $list->leads_count,
            ],
            message: "Successfully added {$addedCount} leads to list."
        );
    }

    /**
     * Remove a single lead from a list.
     */
    public function removeLead(string $id, string $leadId, Request $request): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $list = LeadList::where('workspace_id', $workspaceId)->find($id);

        if (! $list) {
            return ApiResponse::error(
                message: 'Lead list not found in this workspace.',
                statusCode: 404
            );
        }

        LeadListItem::where('lead_list_id', $list->id)
            ->where('lead_id', $leadId)
            ->delete();

        $list->loadCount('leads');

        return ApiResponse::success(
            data: ['total_leads' => $list->leads_count],
            message: 'Lead removed from list.'
        );
    }
}
