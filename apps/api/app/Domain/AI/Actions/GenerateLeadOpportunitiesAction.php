<?php

declare(strict_types=1);

namespace App\Domain\AI\Actions;

use App\Domain\Lead\Models\Lead;
use App\Jobs\AnalyzeLeadJob;

class GenerateLeadOpportunitiesAction
{
    /**
     * Dispatch background AI opportunity extraction and deterministic scoring.
     */
    public function execute(Lead $lead): void
    {
        AnalyzeLeadJob::dispatch($lead->id);
    }
}
