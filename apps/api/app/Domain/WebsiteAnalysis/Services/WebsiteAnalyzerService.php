<?php

declare(strict_types=1);

namespace App\Domain\WebsiteAnalysis\Services;

use App\Domain\WebsiteAnalysis\Models\WebsiteAnalysis;
use Exception;
use Illuminate\Support\Facades\Log;

class WebsiteAnalyzerService
{
    public function __construct(
        private readonly SafeWebsiteFetcher $fetcher,
        private readonly TechnicalSignalExtractor $technicalExtractor,
        private readonly SeoSignalExtractor $seoExtractor,
        private readonly ConversionSignalExtractor $conversionExtractor
    ) {
    }

    /**
     * Execute comprehensive website analysis pipeline.
     */
    public function analyze(WebsiteAnalysis $analysis): WebsiteAnalysis
    {
        $analysis->update([
            'status' => 'crawling',
            'error_message' => null,
        ]);

        try {
            $fetchResult = $this->fetcher->fetch($analysis->url);

            $technicalSignals = $this->technicalExtractor->extract($fetchResult);
            $seoSignals = $this->seoExtractor->extract($fetchResult->html);
            $conversionSignals = $this->conversionExtractor->extract($fetchResult->html);

            $rawSignals = [
                'technical' => $technicalSignals,
                'seo' => $seoSignals,
                'conversion' => $conversionSignals,
            ];

            $analysis->update([
                'status' => 'completed',
                'final_url' => $fetchResult->finalUrl,
                'http_status' => $technicalSignals['http_status'],
                'load_time_ms' => $technicalSignals['load_time_ms'],
                'is_ssl_active' => $technicalSignals['is_ssl_active'],
                'is_mobile_responsive' => $technicalSignals['is_mobile_responsive'],
                'has_meta_description' => $seoSignals['has_meta_description'],
                'has_open_graph' => $seoSignals['has_open_graph'],
                'has_schema_markup' => $seoSignals['has_schema_markup'],
                'h1_tags' => $seoSignals['h1_tags'],
                'has_cta' => $conversionSignals['has_cta'],
                'has_contact_form' => $conversionSignals['has_contact_form'],
                'has_tel_links' => $conversionSignals['has_tel_links'],
                'has_whatsapp_chat' => $conversionSignals['has_whatsapp_chat'],
                'has_booking_embed' => $conversionSignals['has_booking_embed'],
                'cms_detected' => $conversionSignals['cms_detected'],
                'raw_signals' => $rawSignals,
                'error_message' => null,
                'crawled_at' => now(),
            ]);

            return $analysis->fresh();
        } catch (Exception $e) {
            Log::warning("Website analysis failed for analysis [{$analysis->id}] URL [{$analysis->url}]: {$e->getMessage()}");

            $analysis->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            return $analysis->fresh();
        }
    }
}
