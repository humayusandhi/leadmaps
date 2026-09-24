<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Export\Models\ExportJob;
use App\Domain\Export\Services\CsvExportService;
use App\Domain\Lead\Models\Lead;
use App\Jobs\ExportLeadsJob;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    /**
     * Dispatch an asynchronous CSV export job or execute instant download.
     */
    public function store(Request $request, CsvExportService $csvService): JsonResponse|StreamedResponse
    {
        $validated = $request->validate([
            'filters' => 'nullable|array',
            'filters.list_id' => 'nullable|uuid',
            'filters.status' => 'nullable|string',
            'filters.min_score' => 'nullable|integer|min:0|max:100',
            'filters.lead_ids' => 'nullable|array',
            'filters.lead_ids.*' => 'uuid',
            'columns' => 'nullable|array',
            'columns.*' => 'string',
            'direct_download' => 'nullable|boolean',
        ]);

        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;
        $userId = auth()->id() ?? '00000000-0000-0000-0000-000000000001';

        // Direct download pathway for quick UI triggers
        if ($request->boolean('direct_download', false)) {
            $query = Lead::with(['business', 'websiteAnalysis', 'aiOpportunities'])
                ->where('workspace_id', $workspaceId);

            if (! empty($validated['filters']['list_id'])) {
                $query->whereHas('leadLists', function ($q) use ($validated) {
                    $q->where('lead_lists.id', $validated['filters']['list_id']);
                });
            }

            if (! empty($validated['filters']['status'])) {
                $query->where('status', $validated['filters']['status']);
            }

            if (! empty($validated['filters']['min_score'])) {
                $query->where('lead_score', '>=', (int) $validated['filters']['min_score']);
            }

            if (! empty($validated['filters']['lead_ids'])) {
                $query->whereIn('id', $validated['filters']['lead_ids']);
            }

            $leads = $query->limit(2000)->get();
            $csvContent = $csvService->generateCsv($leads, $validated['columns'] ?? null);
            $fileName = 'leads_export_' . date('Ymd_His') . '.csv';

            return response()->streamDownload(
                function () use ($csvContent) {
                    echo $csvContent;
                },
                $fileName,
                [
                    'Content-Type' => 'text/csv; charset=UTF-8',
                    'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
                ]
            );
        }

        // Asynchronous pathway for scalable background exports
        $exportJob = ExportJob::create([
            'id' => (string) Str::uuid(),
            'workspace_id' => $workspaceId,
            'user_id' => $userId,
            'status' => 'PENDING',
            'type' => 'leads_csv',
            'filters' => $validated['filters'] ?? null,
            'columns' => $validated['columns'] ?? null,
        ]);

        ExportLeadsJob::dispatch($exportJob->id);

        return ApiResponse::success(
            data: $exportJob,
            message: 'CSV export initiated successfully.',
            statusCode: 202
        );
    }

    /**
     * Get status of an ongoing export job.
     */
    public function status(string $id, Request $request): JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $job = ExportJob::where('workspace_id', $workspaceId)->find($id);

        if (! $job) {
            return ApiResponse::error(
                message: 'Export job not found.',
                statusCode: 404
            );
        }

        return ApiResponse::success(data: [
            'id' => $job->id,
            'status' => $job->status,
            'row_count' => $job->row_count,
            'file_name' => $job->file_name,
            'download_ready' => $job->status === 'COMPLETED' && ! empty($job->file_path),
            'expires_at' => $job->expires_at?->toIso8601String(),
        ]);
    }

    /**
     * Download completed CSV export file.
     */
    public function download(string $id, Request $request): StreamedResponse|JsonResponse
    {
        $workspaceId = $request->header('X-Workspace-Id') ?? auth()->user()?->current_workspace_id;

        $job = ExportJob::where('workspace_id', $workspaceId)->find($id);

        if (! $job || $job->status !== 'COMPLETED' || ! $job->file_path) {
            return ApiResponse::error(
                message: 'Export file not ready or not found.',
                statusCode: 404
            );
        }

        if (! Storage::disk('local')->exists($job->file_path)) {
            return ApiResponse::error(
                message: 'Export file has expired or was removed.',
                statusCode: 410
            );
        }

        return Storage::disk('local')->download($job->file_path, $job->file_name ?? 'leads_export.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
