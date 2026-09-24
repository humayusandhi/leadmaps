<?php

declare(strict_types=1);

namespace App\Domain\AI\Providers;

use App\Domain\AI\Contracts\AIProviderInterface;
use App\Domain\Lead\Models\Lead;

class MockAIProvider implements AIProviderInterface
{
    public const MODEL_NAME = 'mock-ai-engine-v1';
    public const PROMPT_VERSION = 'v1.0';

    public function analyze(object $lead, array $signals): array
    {
        $business = $lead->business;
        $bizName = $business?->name ?? 'Target Business';
        $websiteAnalysis = $lead->websiteAnalysis ?? null;

        $opportunities = [];

        // 1. Conversion / Booking Opportunity
        $hasBooking = (bool) ($signals['has_booking_embed'] ?? ($websiteAnalysis?->has_booking_embed ?? false));
        if (! $hasBooking) {
            $opportunities[] = [
                'category' => 'BOOKING',
                'title' => 'Automated Appointment Booking & Calendar Funnel',
                'evidence' => "DOM analysis confirmed absence of Calendly, Acuity, or embedded self-scheduling widget on {$bizName}'s site.",
                'suggested_service' => 'Turnkey Calendar Integration, SMS Appointment Reminders & Instant Booking Widget',
                'confidence' => 'HIGH',
                'points_estimated' => 20,
            ];
        }

        // 2. WhatsApp Instant Messaging Opportunity
        $hasWhatsapp = (bool) ($signals['has_whatsapp_chat'] ?? ($websiteAnalysis?->has_whatsapp_chat ?? false));
        if (! $hasWhatsapp) {
            $opportunities[] = [
                'category' => 'WHATSAPP',
                'title' => 'Direct WhatsApp Mobile Lead Capture System',
                'evidence' => "No wa.me or WhatsApp click-to-chat trigger found for mobile visitors browsing {$bizName}.",
                'suggested_service' => 'WhatsApp Business API Setup, Sticky Floating Click-to-Chat & Lead Qualification Bot',
                'confidence' => 'HIGH',
                'points_estimated' => 18,
            ];
        }

        // 3. SEO & Structured Data Opportunity
        $hasSchema = (bool) ($signals['has_schema_markup'] ?? ($websiteAnalysis?->has_schema_markup ?? false));
        $hasOg = (bool) ($signals['has_open_graph'] ?? ($websiteAnalysis?->has_open_graph ?? false));
        if (! $hasSchema || ! $hasOg) {
            $opportunities[] = [
                'category' => 'LOCAL_SEO',
                'title' => 'LocalBusiness Schema & Social Card Snippet Optimization',
                'evidence' => 'Head inspection revealed missing JSON-LD LocalBusiness schema and incomplete OpenGraph metadata tags.',
                'suggested_service' => 'Schema.org Entity Architecture, Rich Snippet Injector & Social Preview Card Branding',
                'confidence' => 'HIGH',
                'points_estimated' => 22,
            ];
        }

        // 4. Performance & Infrastructure Opportunity
        $loadTime = (int) ($signals['load_time_ms'] ?? ($websiteAnalysis?->load_time_ms ?? 650));
        $isSsl = (bool) ($signals['is_ssl_active'] ?? ($websiteAnalysis?->is_ssl_active ?? true));
        if (! $isSsl) {
            $opportunities[] = [
                'category' => 'WEBSITE',
                'title' => 'Zero-Trust SSL/TLS Security Migration',
                'evidence' => 'HTTP handshake operates over unencrypted socket, exposing customer submissions and triggering browser security flags.',
                'suggested_service' => 'Automated TLS Certificate Provisioning, HTTPS Force Redirection & Security Headers (HSTS)',
                'confidence' => 'HIGH',
                'points_estimated' => 25,
            ];
        } elseif ($loadTime > 750) {
            $opportunities[] = [
                'category' => 'PERFORMANCE',
                'title' => 'High-Speed Page Optimization & Edge Delivery',
                'evidence' => "Measured TTFB server response latency at {$loadTime}ms (recommended standard < 500ms).",
                'suggested_service' => 'Cloudflare Edge Caching, WebP Asset Pipeline & Core Web Vitals Acceleration',
                'confidence' => 'MEDIUM',
                'points_estimated' => 16,
            ];
        }

        // 5. Local Reputation Management Opportunity
        $reviewCount = (int) ($business?->review_count ?? 0);
        $rating = (float) ($business?->rating ?? 0.0);
        if ($reviewCount < 40 || $rating < 4.7) {
            $opportunities[] = [
                'category' => 'LOCAL_SEO',
                'title' => 'Google Maps Review Velocity & Authority Booster',
                'evidence' => "Observed {$reviewCount} Google reviews with {$rating} star rating. Competitors in market average > 75 reviews.",
                'suggested_service' => 'Automated Post-Service Review Request Sequences & Google Business Profile Optimization',
                'confidence' => 'MEDIUM',
                'points_estimated' => 19,
            ];
        }

        // Guarantee at least 2 opportunities
        if (count($opportunities) < 2) {
            $opportunities[] = [
                'category' => 'CONVERSION',
                'title' => 'High-Conversion Sticky Hero Call-To-Action Retainer',
                'evidence' => 'Primary landing page lacks prominent above-the-fold value proposition and direct quote trigger.',
                'suggested_service' => 'Conversion Rate Optimization (CRO) Sprint & Sticky Lead Capture Banner',
                'confidence' => 'HIGH',
                'points_estimated' => 20,
            ];
        }

        return [
            'opportunities' => $opportunities,
            'model_used' => self::MODEL_NAME,
            'prompt_version' => self::PROMPT_VERSION,
            'tokens_prompt' => 450,
            'tokens_completion' => 320,
            'raw_output' => [
                'business_name' => $bizName,
                'opportunities' => $opportunities,
            ],
        ];
    }
}
