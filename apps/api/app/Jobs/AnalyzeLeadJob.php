<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\AI\Contracts\AIProviderInterface;
use App\Domain\AI\Models\AiAnalysis;
use App\Domain\AI\Models\AiOpportunity;
use App\Domain\AI\Services\AIOpportunitySchemaValidator;
use App\Domain\Lead\Enums\LeadStatusEnum;
use App\Domain\Lead\Models\Lead;
use App\Domain\Lead\Services\DeterministicLeadScoringService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AnalyzeLeadJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 2;
    public int $timeout = 60;

    public function __construct(
        public readonly string $leadId
    ) {
        $this->onQueue('ai-analysis');
    }

    public function handle(
        AIProviderInterface $aiProvider,
        AIOpportunitySchemaValidator $validator,
        DeterministicLeadScoringService $scorer
    ): void {
        $lead = Lead::with(['business', 'websiteAnalysis'])->find($this->leadId);

        if (! $lead) {
            Log::error("AnalyzeLeadJob failed: Lead [{$this->leadId}] not found.");
            return;
        }

        try {
            $analysis = $lead->websiteAnalysis;
            $signals = $analysis ? $analysis->toArray() : [];

            // 1. Synthesize structured AI opportunities
            $aiResult = $aiProvider->analyze($lead, $signals);
            $sanitizedOpportunities = $validator->validate($aiResult['opportunities']);

            // 2. Persist AI analysis audit record
            $aiAnalysis = AiAnalysis::create([
                'lead_id' => $lead->id,
                'model_used' => $aiResult['model_used'],
                'prompt_version' => $aiResult['prompt_version'],
                'tokens_prompt' => $aiResult['tokens_prompt'],
                'tokens_completion' => $aiResult['tokens_completion'],
                'raw_output' => $aiResult['raw_output'],
            ]);

            // 3. Persist individual opportunities
            AiOpportunity::where('lead_id', $lead->id)->delete();

            foreach ($sanitizedOpportunities as $opp) {
                AiOpportunity::create([
                    'ai_analysis_id' => $aiAnalysis->id,
                    'lead_id' => $lead->id,
                    'category' => $opp['category'],
                    'title' => $opp['title'],
                    'evidence' => $opp['evidence'],
                    'suggested_service' => $opp['suggested_service'],
                    'confidence' => $opp['confidence'],
                    'points_estimated' => $opp['points_estimated'],
                ]);
            }

            // 4. Calculate deterministic mathematical 0–100 lead score & waterfall
            $scorer->calculateAndPersist($lead);

            // 5. Transition status to RESEARCHED if currently NEW
            if ($lead->status === LeadStatusEnum::NEW) {
                $lead->update(['status' => LeadStatusEnum::RESEARCHED]);
            }

            Log::info("AnalyzeLeadJob completed successfully for Lead [{$lead->id}]. Generated " . count($sanitizedOpportunities) . " opportunities.");
        } catch (Exception $e) {
            Log::error("AnalyzeLeadJob encountered error for Lead [{$this->leadId}]: {$e->getMessage()}");
            $this->fail($e);
        }
    }
}
