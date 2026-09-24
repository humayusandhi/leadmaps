<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\WebsiteAnalysis\Models\WebsiteAnalysis;
use App\Domain\WebsiteAnalysis\Services\WebsiteAnalyzerService;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AnalyzeWebsiteJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 2;
    public int $timeout = 30;

    public function __construct(
        public readonly string $analysisId
    ) {
        $this->onQueue('website-analysis');
    }

    public function handle(WebsiteAnalyzerService $analyzer): void
    {
        $analysis = WebsiteAnalysis::find($this->analysisId);

        if (! $analysis) {
            Log::error("AnalyzeWebsiteJob failed: WebsiteAnalysis [{$this->analysisId}] not found.");
            return;
        }

        try {
            $analyzer->analyze($analysis);
        } catch (Exception $e) {
            Log::error("AnalyzeWebsiteJob encountered unhandled exception: {$e->getMessage()}");
            $this->fail($e);
        }
    }
}
