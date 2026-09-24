<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\Integration\Contracts\CRMProviderInterface;
use App\Domain\Integration\Models\Integration;
use App\Domain\Integration\Models\IntegrationLog;
use App\Domain\Integration\Providers\MockCRMProvider;
use App\Domain\Integration\Providers\RiffCRMProvider;
use App\Domain\Lead\Models\Lead;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class SyncCRMLeadJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    /**
     * Exponential backoff in seconds (15s, 60s, 300s).
     *
     * @var array<int, int>
     */
    public array $backoff = [15, 60, 300];

    public function __construct(
        public readonly string $leadId,
        public readonly string $integrationId
    ) {
        $this->onQueue('crm-sync');
    }

    public function handle(): void
    {
        $lead = Lead::with(['business', 'websiteAnalysis', 'aiOpportunities'])->find($this->leadId);
        if (! $lead) {
            Log::error("SyncCRMLeadJob failed: Lead [{$this->leadId}] not found.");
            return;
        }

        $integration = Integration::find($this->integrationId);
        if (! $integration) {
            Log::error("SyncCRMLeadJob failed: Integration [{$this->integrationId}] not found.");
            return;
        }

        // Mark lead as SYNCING
        $lead->update(['crm_sync_status' => 'SYNCING']);

        // Resolve Provider
        $provider = $this->resolveProvider($integration->provider);

        try {
            $credentials = $integration->getDecryptedCredentials();
            $settings = $integration->settings ?? [];

            $result = $provider->syncLead($lead, $credentials, $settings);

            if ($result['success']) {
                $now = now();
                $lead->update([
                    'crm_sync_status' => 'SYNCED',
                    'crm_external_id' => $result['external_id'],
                    'crm_synced_at' => $now,
                ]);

                $integration->update([
                    'status' => 'CONNECTED',
                    'last_synced_at' => $now,
                ]);

                IntegrationLog::create([
                    'workspace_id' => $lead->workspace_id,
                    'integration_id' => $integration->id,
                    'lead_id' => $lead->id,
                    'event' => 'lead_synced',
                    'status' => 'SUCCESS',
                    'external_id' => $result['external_id'] ?? null,
                    'request_payload' => $result['payload_sent'] ?? null,
                    'response_payload' => $result['response_received'] ?? null,
                    'error_message' => null,
                ]);

                Log::info("SyncCRMLeadJob successfully synced Lead [{$lead->id}] to {$integration->provider} as [{$result['external_id']}].");
            } else {
                $errorMsg = $result['message'] ?? 'CRM sync failed';
                $this->handleFailure($lead, $integration, $errorMsg, $result['payload_sent'] ?? [], $result['response_received'] ?? []);
                throw new Exception($errorMsg);
            }
        } catch (Throwable $e) {
            Log::error("SyncCRMLeadJob error for Lead [{$this->leadId}] with Integration [{$this->integrationId}]: " . $e->getMessage());

            if ($this->attempts() >= $this->tries) {
                $this->handleFailure($lead, $integration, $e->getMessage());
            }

            throw $e;
        }
    }

    public function failed(?Throwable $exception): void
    {
        $lead = Lead::find($this->leadId);
        $integration = Integration::find($this->integrationId);

        if ($lead) {
            $lead->update(['crm_sync_status' => 'FAILED']);
        }

        if ($integration) {
            $integration->update([
                'status' => 'ERROR',
            ]);
        }
    }

    /**
     * @param array<string, mixed> $payloadSent
     * @param array<string, mixed> $responseReceived
     */
    protected function handleFailure(
        Lead $lead,
        Integration $integration,
        string $message,
        array $payloadSent = [],
        array $responseReceived = []
    ): void {
        $lead->update(['crm_sync_status' => 'FAILED']);

        $integration->update([
            'status' => 'ERROR',
        ]);

        IntegrationLog::create([
            'workspace_id' => $lead->workspace_id,
            'integration_id' => $integration->id,
            'lead_id' => $lead->id,
            'event' => 'lead_synced',
            'status' => 'FAILED',
            'external_id' => null,
            'request_payload' => !empty($payloadSent) ? $payloadSent : null,
            'response_payload' => !empty($responseReceived) ? $responseReceived : null,
            'error_message' => $message,
        ]);
    }

    protected function resolveProvider(string $providerName): CRMProviderInterface
    {
        return match (strtolower($providerName)) {
            'riffcrm' => app(RiffCRMProvider::class),
            'mock' => app(MockCRMProvider::class),
            default => app(MockCRMProvider::class),
        };
    }
}
