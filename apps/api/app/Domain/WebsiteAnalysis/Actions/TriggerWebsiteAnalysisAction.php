<?php

declare(strict_types=1);

namespace App\Domain\WebsiteAnalysis\Actions;

use App\Domain\Lead\Models\Lead;
use App\Domain\WebsiteAnalysis\Exceptions\SecurityViolationException;
use App\Domain\WebsiteAnalysis\Models\WebsiteAnalysis;
use App\Domain\WebsiteAnalysis\Services\SsrfProtectionService;
use App\Jobs\AnalyzeWebsiteJob;
use DomainException;
use InvalidArgumentException;

class TriggerWebsiteAnalysisAction
{
    public function __construct(
        private readonly SsrfProtectionService $ssrfProtection
    ) {
    }

    /**
     * Trigger asynchronous website analysis for a given lead.
     *
     * @throws DomainException
     * @throws InvalidArgumentException
     * @throws SecurityViolationException
     */
    public function execute(Lead $lead, ?string $overrideUrl = null): WebsiteAnalysis
    {
        $business = $lead->business;
        $targetUrl = trim((string) ($overrideUrl ?: ($business?->website_url ?? '')));

        if ($targetUrl === '') {
            throw new DomainException('Lead business does not have a website URL to analyze.');
        }

        // Validate URL against SSRF rules before queueing
        $normalizedUrl = $this->ssrfProtection->validateUrl($targetUrl);

        $analysis = WebsiteAnalysis::create([
            'lead_id' => $lead->id,
            'url' => $normalizedUrl,
            'status' => 'pending',
        ]);

        AnalyzeWebsiteJob::dispatch($analysis->id);

        return $analysis;
    }
}
