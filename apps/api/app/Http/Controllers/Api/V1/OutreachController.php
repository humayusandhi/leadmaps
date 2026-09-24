<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\AI\Actions\GenerateOutreachDraftAction;
use App\Domain\AI\Models\AiOutreachDraft;
use App\Domain\Lead\Models\Lead;
use App\Jobs\GenerateOutreachJob;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class OutreachController extends Controller
{
    /**
     * Generate multi-channel AI outreach drafts for a lead.
     */
    public function generate(
        string $leadId,
        Request $request,
        GenerateOutreachDraftAction $action
    ): JsonResponse {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $lead = Lead::with(['business', 'websiteAnalysis', 'aiOpportunities'])
            ->where('workspace_id', $workspaceId)
            ->find($leadId);

        if (! $lead) {
            return ApiResponse::error(
                message: 'Lead not found in this workspace.',
                statusCode: 404
            );
        }

        // Support asynchronous generation or immediate synchronous synthesis
        if ($request->boolean('async', false)) {
            GenerateOutreachJob::dispatch($lead->id);

            return ApiResponse::success(
                message: 'Outreach generation job queued successfully.',
                statusCode: 202
            );
        }

        $drafts = $action->execute($lead);

        return ApiResponse::success(
            data: array_values($drafts),
            message: 'Outreach drafts synthesized successfully.'
        );
    }

    /**
     * Get all outreach drafts for a lead.
     */
    public function index(string $leadId, Request $request): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $lead = Lead::where('workspace_id', $workspaceId)->find($leadId);

        if (! $lead) {
            return ApiResponse::error(
                message: 'Lead not found in this workspace.',
                statusCode: 404
            );
        }

        $drafts = AiOutreachDraft::where('lead_id', $leadId)
            ->where('workspace_id', $workspaceId)
            ->get();

        return ApiResponse::success(data: $drafts);
    }

    /**
     * Update an individual outreach draft (e.g. customized by sales rep).
     */
    public function update(string $id, Request $request): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $draft = AiOutreachDraft::where('workspace_id', $workspaceId)->find($id);

        if (! $draft) {
            return ApiResponse::error(
                message: 'Outreach draft not found.',
                statusCode: 404
            );
        }

        $validated = $request->validate([
            'subject' => 'nullable|string|max:255',
            'body' => 'required|string|max:5000',
            'status' => 'sometimes|string|in:draft,approved,sent,rejected',
        ]);

        $draft->update($validated);

        return ApiResponse::success(
            data: $draft,
            message: 'Outreach draft updated successfully.'
        );
    }
}
