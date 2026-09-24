<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\Export\Models\ExportJob;
use App\Domain\Export\Services\CsvExportService;
use App\Domain\Lead\Models\Lead;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ExportLeadsJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 2;
    public int $timeout = 180;

    public function __construct(
        public readonly string $exportJobId
    ) {
        $this->onQueue('exports');
    }

    public function handle(CsvExportService $exportService): void
    {
        $job = ExportJob::find($this->exportJobId);

        if (! $job) {
            Log::error("ExportLeadsJob failed: ExportJob [{$this->exportJobId}] not found.");
            return;
        }

        try {
            $job->update(['status' => 'PROCESSING']);

            // Fetch leads filtered by workspace and optional filters
            $query = Lead::with(['business', 'websiteAnalysis', 'aiOpportunities'])
                ->where('workspace_id', $job->workspace_id);

            if (! empty($job->filters['list_id'])) {
                $query->whereHas('leadLists', function ($q) use ($job) {
                    $q->where('lead_lists.id', $job->filters['list_id']);
                });
            }

            if (! empty($job->filters['status'])) {
                $query->where('status', $job->filters['status']);
            }

            if (! empty($job->filters['min_score'])) {
                $query->where('lead_score', '>=', (int) $job->filters['min_score']);
            }

            if (! empty($job->filters['lead_ids']) && is_array($job->filters['lead_ids'])) {
                $query->whereIn('id', $job->filters['lead_ids']);
            }

            $leads = $query->get();
            $csvContent = $exportService->generateCsv($leads, $job->columns);

            $fileName = "leads_export_" . date('Ymd_His') . "_{$job->id}.csv";
            $storagePath = "exports/{$job->workspace_id}/{$fileName}";

            Storage::disk('local')->put($storagePath, $csvContent);

            $job->update([
                'status' => 'COMPLETED',
                'file_path' => $storagePath,
                'file_name' => $fileName,
                'row_count' => count($leads),
                'expires_at' => now()->addDays(7),
            ]);

            Log::info("ExportLeadsJob completed for Job [{$job->id}], rows: " . count($leads));
        } catch (Exception $e) {
            $job->update(['status' => 'FAILED']);
            Log::error("ExportLeadsJob failed for Job [{$job->id}]: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            throw $e;
        }
    }
}
