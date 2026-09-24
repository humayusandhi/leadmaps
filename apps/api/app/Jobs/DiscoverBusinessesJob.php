<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Domain\Business\Contracts\BusinessDiscoveryProvider;
use App\Domain\Business\DTOs\DiscoveryCriteria;
use App\Domain\Business\Models\Business;
use App\Domain\Business\Models\Search;
use App\Domain\Business\Models\SearchResult;
use App\Domain\Business\Services\BusinessNormalizerService;
use App\Domain\Workspace\Models\Workspace;
use Exception;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DiscoverBusinessesJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 2;
    public int $timeout = 60;

    public function __construct(
        public readonly string $searchId,
        public readonly string $workspaceId,
    ) {
        $this->onQueue('search');
    }

    public function handle(
        BusinessDiscoveryProvider $provider,
        BusinessNormalizerService $normalizer
    ): void {
        $search = Search::withoutGlobalScopes()->find($this->searchId);

        if (! $search) {
            Log::error("DiscoverBusinessesJob failed: Search [{$this->searchId}] not found.");
            return;
        }

        $workspace = Workspace::find($this->workspaceId);
        if (! $workspace) {
            $search->update(['status' => 'FAILED']);
            Log::error("DiscoverBusinessesJob failed: Workspace [{$this->workspaceId}] not found.");
            return;
        }

        // 1. Verify credit balance and reserve 1 credit
        $creditDeducted = false;

        try {
            DB::transaction(function () use ($workspace, $search, &$creditDeducted) {
                $workspaceFresh = Workspace::where('id', $workspace->id)->lockForUpdate()->first();

                if (! $workspaceFresh || $workspaceFresh->credit_balance < 1) {
                    throw new Exception('Insufficient credit balance in workspace.');
                }

                $workspaceFresh->decrement('credit_balance', 1);
                $creditDeducted = true;

                $search->update(['status' => 'PROCESSING']);
            });

            // 2. Prepare discovery criteria
            $filters = $search->filters ?? [];
            $criteria = new DiscoveryCriteria(
                category: $search->category,
                location: $search->location,
                radiusKm: $search->radius_km,
                hasWebsite: isset($filters['has_website']) ? (bool) $filters['has_website'] : null,
                minRating: isset($filters['min_rating']) ? (float) $filters['min_rating'] : null,
                minReviews: isset($filters['min_reviews']) ? (int) $filters['min_reviews'] : null,
            );

            // 3. Execute provider query
            $discoveryResult = $provider->search($criteria);

            // 4. Normalize and persist results
            DB::transaction(function () use ($discoveryResult, $search, $normalizer) {
                $rank = 1;
                foreach ($discoveryResult->places as $rawPlace) {
                    $normalized = $normalizer->normalize($rawPlace, $this->workspaceId);

                    if (empty($normalized['google_place_id']) || empty($normalized['name'])) {
                        continue;
                    }

                    // Upsert business
                    $business = Business::updateOrCreate(
                        ['google_place_id' => $normalized['google_place_id']],
                        [
                            'name' => $normalized['name'],
                            'formatted_address' => $normalized['formatted_address'],
                            'city' => $normalized['city'],
                            'country' => $normalized['country'],
                            'phone_number' => $normalized['phone_number'],
                            'website_url' => $normalized['website_url'],
                            'rating' => $normalized['rating'],
                            'review_count' => $normalized['review_count'],
                            'latitude' => $normalized['latitude'],
                            'longitude' => $normalized['longitude'],
                            'raw_provider_payload' => $normalized['raw_provider_payload'],
                        ]
                    );

                    // Attach to search results
                    SearchResult::firstOrCreate(
                        [
                            'search_id' => $search->id,
                            'business_id' => $business->id,
                        ],
                        [
                            'rank' => $rank++,
                        ]
                    );
                }

                $search->update([
                    'status' => 'COMPLETED',
                    'total_results' => $search->businesses()->count(),
                ]);
            });
        } catch (Exception $e) {
            Log::error('DiscoverBusinessesJob execution failed', [
                'search_id' => $this->searchId,
                'error' => $e->getMessage(),
            ]);

            // Refund credit if deducted prior to failure
            if ($creditDeducted) {
                try {
                    Workspace::where('id', $this->workspaceId)->increment('credit_balance', 1);
                } catch (\Throwable $refundError) {
                    Log::critical('Failed to refund credit after discovery failure', [
                        'workspace_id' => $this->workspaceId,
                        'error' => $refundError->getMessage(),
                    ]);
                }
            }

            $search->update(['status' => 'FAILED']);
            throw $e;
        }
    }
}
