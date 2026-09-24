<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Lead\Actions\AddLeadNoteAction;
use App\Domain\Lead\Actions\RemoveTagFromLeadAction;
use App\Domain\Lead\Actions\SaveBusinessAsLeadAction;
use App\Domain\Lead\Actions\TagLeadAction;
use App\Domain\Lead\Actions\UpdateLeadStatusAction;
use App\Domain\Lead\Models\Lead;
use App\Domain\Lead\Models\Tag;
use App\Http\Requests\V1\Lead\AddNoteRequest;
use App\Http\Requests\V1\Lead\AssignLeadRequest;
use App\Http\Requests\V1\Lead\AttachTagRequest;
use App\Http\Requests\V1\Lead\SaveLeadRequest;
use App\Http\Requests\V1\Lead\UpdateLeadStatusRequest;
use App\Support\ApiResponse;
use DomainException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class LeadController extends Controller
{
    /**
     * List paginated leads in the active workspace with rich filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Lead::active()->with(['business', 'tags', 'assignedUser']);

        // Filter by Status
        if ($request->filled('status') && $request->input('status') !== 'ALL') {
            $query->where('status', $request->input('status'));
        }

        // Filter by Minimum Lead Score
        if ($request->filled('min_score')) {
            $query->where('lead_score', '>=', (int) $request->input('min_score'));
        }

        // Filter by Tag Name
        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('name', $request->input('tag'));
            });
        }

        // Search by business name, address, or phone
        if ($request->filled('search')) {
            $search = '%' . trim($request->input('search')) . '%';
            $query->whereHas('business', function ($q) use ($search) {
                $q->where('name', 'ilike', $search)
                  ->orWhere('formatted_address', 'ilike', $search)
                  ->orWhere('phone_number', 'like', $search);
            });
        }

        // Sorting
        $sort = $request->input('sort', 'score_desc');
        match ($sort) {
            'score_asc' => $query->orderBy('lead_score', 'asc')->orderBy('created_at', 'desc'),
            'newest' => $query->orderBy('created_at', 'desc'),
            'oldest' => $query->orderBy('created_at', 'asc'),
            default => $query->orderByRaw('lead_score DESC NULLS LAST')->orderBy('created_at', 'desc'),
        };

        $perPage = min((int) $request->input('per_page', 20), 100);
        $leads = $query->paginate($perPage);

        return ApiResponse::success(
            data: $leads->items(),
            meta: [
                'pagination' => [
                    'current_page' => $leads->currentPage(),
                    'per_page' => $leads->perPage(),
                    'total' => $leads->total(),
                    'last_page' => $leads->lastPage(),
                ],
            ]
        );
    }

    /**
     * Save a business as a new lead in the active workspace.
     * Consumes 1 credit per lead.
     */
    public function store(SaveLeadRequest $request, SaveBusinessAsLeadAction $action): JsonResponse
    {
        $workspaceId = (string) app('current_workspace_id');
        $validated = $request->validated();

        try {
            $lead = $action->execute(
                workspaceId: $workspaceId,
                businessId: $validated['business_id'],
                assignedUserId: $validated['assigned_to_user_id'] ?? null
            );

            return ApiResponse::success(
                data: $lead,
                message: 'Business saved as lead successfully (1 credit used).',
                statusCode: 201
            );
        } catch (DomainException $e) {
            return ApiResponse::error(
                message: $e->getMessage(),
                statusCode: 402,
                errors: [
                    'code' => 'INSUFFICIENT_CREDITS',
                    'required_credits' => 1,
                    'credits' => 'Your workspace has depleted its usage credits. 1 credit is required per saved lead.',
                ]
            );
        }
    }

    /**
     * Retrieve complete dossier for a single lead.
     */
    public function show(string $id): JsonResponse
    {
        $lead = Lead::with(['business', 'tags', 'notes.user', 'scores', 'assignedUser', 'websiteAnalysis', 'aiOpportunities'])->find($id);

        if (! $lead) {
            return ApiResponse::error(
                message: 'Lead not found in this workspace.',
                statusCode: 404
            );
        }

        return ApiResponse::success(data: $lead);
    }

    /**
     * Transition lead lifecycle status adhering to state machine.
     */
    public function updateStatus(
        string $id,
        UpdateLeadStatusRequest $request,
        UpdateLeadStatusAction $action
    ): JsonResponse {
        $lead = Lead::find($id);

        if (! $lead) {
            return ApiResponse::error(
                message: 'Lead not found.',
                statusCode: 404
            );
        }

        try {
            $updated = $action->execute($lead, $request->validated('status'));

            return ApiResponse::success(
                data: $updated->load(['business', 'tags']),
                message: 'Lead status updated successfully.'
            );
        } catch (DomainException $e) {
            return ApiResponse::error(
                message: $e->getMessage(),
                statusCode: 422
            );
        }
    }

    /**
     * Add a team note to a lead.
     */
    public function addNote(string $id, AddNoteRequest $request, AddLeadNoteAction $action): JsonResponse
    {
        $lead = Lead::find($id);

        if (! $lead) {
            return ApiResponse::error(message: 'Lead not found.', statusCode: 404);
        }

        $user = $request->user();
        $note = $action->execute($lead, $user->id, $request->validated('content'));

        return ApiResponse::success(
            data: $note,
            message: 'Note added successfully.',
            statusCode: 201
        );
    }

    /**
     * Attach a tag to a lead.
     */
    public function attachTag(string $id, AttachTagRequest $request, TagLeadAction $action): JsonResponse
    {
        $lead = Lead::find($id);

        if (! $lead) {
            return ApiResponse::error(message: 'Lead not found.', statusCode: 404);
        }

        $tag = $action->execute(
            lead: $lead,
            tagName: $request->validated('name'),
            color: $request->validated('color')
        );

        return ApiResponse::success(
            data: $tag,
            message: 'Tag attached successfully.',
            statusCode: 201
        );
    }

    /**
     * Remove a tag from a lead.
     */
    public function detachTag(string $id, string $tagId, RemoveTagFromLeadAction $action): JsonResponse
    {
        $lead = Lead::find($id);

        if (! $lead) {
            return ApiResponse::error(message: 'Lead not found.', statusCode: 404);
        }

        $action->execute($lead, $tagId);

        return ApiResponse::success(message: 'Tag removed successfully.');
    }

    /**
     * Assign lead to a workspace member.
     */
    public function assign(string $id, AssignLeadRequest $request): JsonResponse
    {
        $lead = Lead::find($id);

        if (! $lead) {
            return ApiResponse::error(message: 'Lead not found.', statusCode: 404);
        }

        $lead->update([
            'assigned_to_user_id' => $request->validated('assigned_to_user_id'),
        ]);

        return ApiResponse::success(
            data: $lead->load('assignedUser'),
            message: 'Lead assigned successfully.'
        );
    }

    /**
     * Soft delete / archive lead.
     */
    public function destroy(string $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (! $lead) {
            return ApiResponse::error(message: 'Lead not found.', statusCode: 404);
        }

        $lead->update(['archived_at' => now()]);

        return ApiResponse::success(message: 'Lead archived successfully.');
    }
}
