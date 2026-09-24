<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\AI\Actions\GenerateLeadOpportunitiesAction;
use App\Domain\AI\Models\AiOpportunity;
use App\Domain\Lead\Models\Lead;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class OpportunityController extends Controller
{
    /**
     * Trigger asynchronous AI opportunity generation and scoring for a lead.
     */
    public function generate(string $leadId, GenerateLeadOpportunitiesAction $action): JsonResponse
    {
        $lead = Lead::with('business')->find($leadId);

        if (! $lead) {
            return ApiResponse::error(
                message: 'Lead not found in this workspace.',
                statusCode: 404
            );
        }

        $action->execute($lead);

        return ApiResponse::success(
            message: 'Lead intelligence & AI opportunity analysis queued successfully.',
            statusCode: 202
        );
    }

    /**
     * List generated AI opportunities for a lead.
     */
    public function index(string $leadId): JsonResponse
    {
        $lead = Lead::find($leadId);

        if (! $lead) {
            return ApiResponse::error(
                message: 'Lead not found in this workspace.',
                statusCode: 404
            );
        }

        $opportunities = AiOpportunity::where('lead_id', $leadId)
            ->orderBy('points_estimated', 'desc')
            ->get();

        return ApiResponse::success(data: $opportunities);
    }
}
