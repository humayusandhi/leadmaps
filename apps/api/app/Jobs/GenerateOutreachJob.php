<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\AI\Actions\GenerateOutreachDraftAction;
use App\Domain\Lead\Models\Lead;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateOutreachJob implements ShouldQueue
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
        $this->onQueue('ai-outreach');
    }

    public function handle(GenerateOutreachDraftAction $action): void
    {
        $lead = Lead::with(['business', 'websiteAnalysis', 'aiOpportunities'])->find($this->leadId);

        if (! $lead) {
            Log::error("GenerateOutreachJob failed: Lead [{$this->leadId}] not found.");
            return;
        }

        try {
            $action->execute($lead);
            Log::info("GenerateOutreachJob completed successfully for Lead [{$lead->id}].");
        } catch (Exception $e) {
            Log::error("GenerateOutreachJob error for Lead [{$lead->id}]: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }
}
