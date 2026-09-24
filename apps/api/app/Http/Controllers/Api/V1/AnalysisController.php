<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Lead\Models\Lead;
use App\Domain\WebsiteAnalysis\Actions\TriggerWebsiteAnalysisAction;
use App\Domain\WebsiteAnalysis\Exceptions\SecurityViolationException;
use App\Domain\WebsiteAnalysis\Models\WebsiteAnalysis;
use App\Support\ApiResponse;
use DomainException;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AnalysisController extends Controller
{
    /**
     * Trigger asynchronous website analysis for a lead.
     */
    public function analyzeLead(
        string $leadId,
        Request $request,
        TriggerWebsiteAnalysisAction $action
    ): JsonResponse {
        $lead = Lead::with('business')->find($leadId);

        if (! $lead) {
            return ApiResponse::error(
                message: 'Lead not found in this workspace.',
                statusCode: 404
            );
        }

        $overrideUrl = $request->input('url');

        try {
            $analysis = $action->execute($lead, $overrideUrl);

            return ApiResponse::success(
                data: $analysis,
                message: 'Website analysis queued successfully.',
                statusCode: 202
            );
        } catch (SecurityViolationException $e) {
            return ApiResponse::error(
                message: 'Security validation failed: ' . $e->getMessage(),
                statusCode: 422
            );
        } catch (DomainException $e) {
            return ApiResponse::error(
                message: $e->getMessage(),
                statusCode: 422
            );
        } catch (Exception $e) {
            return ApiResponse::error(
                message: 'Failed to queue website analysis: ' . $e->getMessage(),
                statusCode: 500
            );
        }
    }

    /**
     * Retrieve the latest website analysis for a lead.
     */
    public function showByLead(string $leadId): JsonResponse
    {
        $lead = Lead::find($leadId);

        if (! $lead) {
            return ApiResponse::error(
                message: 'Lead not found in this workspace.',
                statusCode: 404
            );
        }

        $analysis = WebsiteAnalysis::where('lead_id', $leadId)
            ->latest()
            ->first();

        if (! $analysis) {
            return ApiResponse::error(
                message: 'No website analysis found for this lead.',
                statusCode: 404
            );
        }

        return ApiResponse::success(data: $analysis);
    }

    /**
     * Retrieve a specific website analysis by ID.
     */
    public function show(string $id): JsonResponse
    {
        $analysis = WebsiteAnalysis::with('lead.business')->find($id);

        if (! $analysis) {
            return ApiResponse::error(
                message: 'Website analysis not found.',
                statusCode: 404
            );
        }

        // Enforce workspace tenant check via lead
        $workspaceId = (string) app('current_workspace_id');
        if ($analysis->lead->workspace_id !== $workspaceId) {
            return ApiResponse::error(
                message: 'Unauthorized access to this analysis.',
                statusCode: 403
            );
        }

        return ApiResponse::success(data: $analysis);
    }
}
