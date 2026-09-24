<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Domain\Integration\Contracts\CRMProviderInterface;
use App\Domain\Integration\Models\Integration;
use App\Domain\Integration\Models\IntegrationLog;
use App\Domain\Integration\Providers\MockCRMProvider;
use App\Domain\Integration\Providers\RiffCRMProvider;
use App\Domain\Lead\Models\Lead;
use App\Jobs\SyncCRMLeadJob;
use App\Support\ApiResponse;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class IntegrationController extends Controller
{
    /**
     * List all integrations configured for the active workspace.
     */
    public function index(Request $request): JsonResponse
    {
        $workspaceId = $this->resolveWorkspaceId($request);

        $integrations = Integration::where('workspace_id', $workspaceId)
            ->withCount([
                'logs as total_syncs_count' => function ($q) {
                    $q->where('event', 'lead_synced');
                },
                'logs as successful_syncs_count' => function ($q) {
                    $q->where('event', 'lead_synced')->where('status', 'SUCCESS');
                },
                'logs as failed_syncs_count' => function ($q) {
                    $q->where('event', 'lead_synced')->where('status', 'FAILED');
                },
            ])
            ->get();

        $formatted = $integrations->map(function (Integration $integration) {
            $creds = $integration->getDecryptedCredentials();
            $apiKey = (string) ($creds['api_key'] ?? '');
            $maskedKey = !empty($apiKey)
                ? (strlen($apiKey) > 8 ? '••••••••' . substr($apiKey, -4) : '••••••••')
                : null;

            return [
                'id' => $integration->id,
                'workspace_id' => $integration->workspace_id,
                'provider' => $integration->provider,
                'name' => $integration->name,
                'status' => $integration->status,
                'has_credentials' => !empty($creds),
                'masked_api_key' => $maskedKey,
                'base_url' => $creds['base_url'] ?? null,
                'settings' => $integration->settings ?? [],
                'last_synced_at' => $integration->last_synced_at?->toIso8601String(),
                'created_at' => $integration->created_at?->toIso8601String(),
                'updated_at' => $integration->updated_at?->toIso8601String(),
                'stats' => [
                    'total_syncs' => $integration->total_syncs_count ?? 0,
                    'successful_syncs' => $integration->successful_syncs_count ?? 0,
                    'failed_syncs' => $integration->failed_syncs_count ?? 0,
                ],
            ];
        });

        return ApiResponse::success($formatted, 'Integrations retrieved.');
    }

    /**
     * Connect or update a CRM integration with credential verification.
     */
    public function connect(Request $request): JsonResponse
    {
        $workspaceId = $this->resolveWorkspaceId($request);

        $validated = $request->validate([
            'provider' => 'required|string|in:riffcrm,hubspot,salesforce,mock,webhook',
            'name' => 'nullable|string|max:100',
            'credentials' => 'required|array',
            'credentials.api_key' => 'required_without:credentials.token|string',
            'credentials.base_url' => 'nullable|url',
            'settings' => 'nullable|array',
            'test_before_connect' => 'nullable|boolean',
        ]);

        $providerName = strtolower($validated['provider']);
        $provider = $this->resolveCRMProvider($providerName);
        $credentials = $validated['credentials'];

        // Verify credentials if requested (defaults to true)
        $shouldTest = $request->boolean('test_before_connect', true);
        if ($shouldTest) {
            $testedOk = $provider->testConnection($credentials);
            if (! $testedOk) {
                return ApiResponse::error(
                    'Connection test failed. The CRM rejected the provided API key or endpoint.',
                    422
                );
            }
        }

        $integration = Integration::updateOrCreate(
            [
                'workspace_id' => $workspaceId,
                'provider' => $providerName,
            ],
            [
                'name' => $validated['name'] ?? ucfirst($providerName) . ' Integration',
                'credentials' => $credentials,
                'settings' => $validated['settings'] ?? [
                    'auto_sync_high_score' => false,
                    'score_threshold' => 80,
                    'sync_tags' => true,
                ],
                'status' => 'CONNECTED',
            ]
        );

        // Record verification in logs
        IntegrationLog::create([
            'workspace_id' => $workspaceId,
            'integration_id' => $integration->id,
            'event' => 'connection_test',
            'status' => 'SUCCESS',
            'request_payload' => ['provider' => $providerName, 'tested_at' => now()->toIso8601String()],
            'response_payload' => ['authenticated' => true],
        ]);

        return ApiResponse::success([
            'id' => $integration->id,
            'provider' => $integration->provider,
            'name' => $integration->name,
            'status' => $integration->status,
        ], 'Integration connected and verified successfully.');
    }

    /**
     * Test connection for an existing integration.
     */
    public function test(Request $request, string $id): JsonResponse
    {
        $workspaceId = $this->resolveWorkspaceId($request);
        $integration = Integration::where('workspace_id', $workspaceId)->findOrFail($id);

        $provider = $this->resolveCRMProvider($integration->provider);
        $credentials = $request->input('credentials') ?? $integration->getDecryptedCredentials();

        if (empty($credentials)) {
            return ApiResponse::error('No credentials found for this integration.', 400);
        }

        $success = $provider->testConnection($credentials);

        IntegrationLog::create([
            'workspace_id' => $workspaceId,
            'integration_id' => $integration->id,
            'event' => 'connection_test',
            'status' => $success ? 'SUCCESS' : 'FAILED',
            'request_payload' => ['tested_at' => now()->toIso8601String()],
            'response_payload' => ['success' => $success],
            'error_message' => $success ? null : 'CRM connection handshake failed',
        ]);

        if (! $success) {
            $integration->update(['status' => 'ERROR']);
            return ApiResponse::error('Connection test failed. CRM returned authentication or reachability failure.', 422);
        }

        $integration->update(['status' => 'CONNECTED']);

        return ApiResponse::success([
            'connected' => true,
            'provider' => $integration->provider,
        ], 'CRM connection verified successfully.');
    }

    /**
     * Disconnect an integration.
     */
    public function disconnect(Request $request, string $id): JsonResponse
    {
        $workspaceId = $this->resolveWorkspaceId($request);
        $integration = Integration::where('workspace_id', $workspaceId)->findOrFail($id);

        $integration->update([
            'status' => 'DISCONNECTED',
            'credentials' => [],
        ]);

        IntegrationLog::create([
            'workspace_id' => $workspaceId,
            'integration_id' => $integration->id,
            'event' => 'connection_test',
            'status' => 'SUCCESS',
            'response_payload' => ['action' => 'disconnected'],
        ]);

        return ApiResponse::success(null, "Integration {$integration->provider} disconnected.");
    }

    /**
     * Sync a specific lead to CRM.
     */
    public function syncLead(Request $request, string $id): JsonResponse
    {
        $workspaceId = $this->resolveWorkspaceId($request);
        $integration = Integration::where('workspace_id', $workspaceId)->findOrFail($id);

        if ($integration->status !== 'CONNECTED') {
            return ApiResponse::error('Integration is not connected. Please connect and verify credentials first.', 400);
        }

        $validated = $request->validate([
            'lead_id' => 'required|uuid',
            'sync_now' => 'nullable|boolean',
        ]);

        $lead = Lead::where('workspace_id', $workspaceId)->findOrFail($validated['lead_id']);

        $syncNow = $request->boolean('sync_now', false);

        if ($syncNow) {
            try {
                $job = new SyncCRMLeadJob($lead->id, $integration->id);
                $job->handle();

                $lead->refresh();

                if ($lead->crm_sync_status === 'SYNCED') {
                    return ApiResponse::success([
                        'lead_id' => $lead->id,
                        'crm_sync_status' => $lead->crm_sync_status,
                        'crm_external_id' => $lead->crm_external_id,
                        'crm_synced_at' => $lead->crm_synced_at?->toIso8601String(),
                    ], 'Lead successfully synchronized with CRM.');
                }

                return ApiResponse::error(
                    'Lead sync failed during direct execution. Check integration logs.',
                    500,
                    ['lead_id' => $lead->id, 'crm_sync_status' => $lead->crm_sync_status]
                );
            } catch (Exception $e) {
                return ApiResponse::error('CRM sync execution failed: ' . $e->getMessage(), 500);
            }
        }

        // Asynchronous queue dispatch
        SyncCRMLeadJob::dispatch($lead->id, $integration->id);

        return ApiResponse::success([
            'lead_id' => $lead->id,
            'integration_id' => $integration->id,
            'queued' => true,
            'status' => 'QUEUED',
        ], 'Lead sync dispatched to CRM queue.', 202);
    }

    /**
     * Get paginated audit logs for an integration.
     */
    public function logs(Request $request, string $id): JsonResponse
    {
        $workspaceId = $this->resolveWorkspaceId($request);
        $integration = Integration::where('workspace_id', $workspaceId)->findOrFail($id);

        $perPage = min((int) $request->input('per_page', 20), 100);

        $logs = IntegrationLog::where('integration_id', $integration->id)
            ->with(['lead.business'])
            ->latest()
            ->paginate($perPage);

        $data = $logs->getCollection()->map(function (IntegrationLog $log) {
            return [
                'id' => $log->id,
                'event' => $log->event,
                'status' => $log->status,
                'external_id' => $log->external_id,
                'lead_id' => $log->lead_id,
                'business_name' => $log->lead?->business?->name,
                'request_payload' => $log->request_payload,
                'response_payload' => $log->response_payload,
                'error_message' => $log->error_message,
                'created_at' => $log->created_at?->toIso8601String(),
            ];
        });

        return ApiResponse::success(
            $data,
            'Integration logs retrieved.',
            meta: [
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                    'last_page' => $logs->lastPage(),
                ],
            ]
        );
    }

    protected function resolveWorkspaceId(Request $request): string
    {
        return (string) ($request->header('X-Workspace-Id')
            ?? auth()->user()?->current_workspace_id
            ?? (app()->has('current_workspace_id') ? app('current_workspace_id') : null)
            ?? '00000000-0000-0000-0000-000000000001');
    }

    protected function resolveCRMProvider(string $providerName): CRMProviderInterface
    {
        return match (strtolower($providerName)) {
            'riffcrm' => app(RiffCRMProvider::class),
            'mock' => app(MockCRMProvider::class),
            default => app(MockCRMProvider::class),
        };
    }
}
