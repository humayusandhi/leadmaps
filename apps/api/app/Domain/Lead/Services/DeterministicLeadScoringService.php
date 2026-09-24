<?php

declare(strict_types=1);

namespace App\Domain\Lead\Services;

use App\Domain\Lead\Models\Lead;
use App\Domain\Lead\Models\LeadScore;

class DeterministicLeadScoringService
{
    /**
     * Calculate deterministic lead score and score breakdown.
     *
     * @param array<string, mixed> $businessData
     * @param array<string, mixed>|null $websiteAnalysisData
     * @return array{
     *     total_score: int,
     *     breakdown: array<int, array{
     *         dimension: string,
     *         awarded_points: int,
     *         max_points: int,
     *         rationale: string
     *     }>
     * }
     */
    public function calculate(array $businessData, ?array $websiteAnalysisData = null): array
    {
        $hasWebsite = !empty($businessData['website_url']) || !empty($websiteAnalysisData['url']);

        // 1. Technical Health (Max 25 pts)
        $tech = $this->calculateTechnicalHealth($hasWebsite, $websiteAnalysisData);

        // 2. SEO Visibility (Max 25 pts)
        $seo = $this->calculateSeoVisibility($hasWebsite, $websiteAnalysisData);

        // 3. Conversion Infrastructure (Max 25 pts)
        $conversion = $this->calculateConversionInfrastructure($hasWebsite, $websiteAnalysisData);

        // 4. Local Reputation & Authority (Max 25 pts)
        $reputation = $this->calculateLocalReputation($businessData);

        $totalScore = $tech['awarded_points'] + $seo['awarded_points'] + $conversion['awarded_points'] + $reputation['awarded_points'];
        $totalScore = max(0, min(100, $totalScore));

        return [
            'total_score' => $totalScore,
            'breakdown' => [
                $tech,
                $seo,
                $conversion,
                $reputation,
            ],
        ];
    }

    /**
     * Calculate and persist scores onto a Lead Eloquent model.
     */
    public function calculateAndPersist(Lead $lead): Lead
    {
        $business = $lead->business;
        $businessData = [
            'google_place_id' => $business?->google_place_id,
            'name' => $business?->name,
            'phone_number' => $business?->phone_number,
            'website_url' => $business?->website_url,
            'rating' => $business?->rating,
            'review_count' => $business?->review_count,
        ];

        $analysis = $lead->websiteAnalysis;
        $analysisData = $analysis ? $analysis->toArray() : null;

        $result = $this->calculate($businessData, $analysisData);

        // Persist dimensional breakdown into lead_scores table
        LeadScore::where('lead_id', $lead->id)->delete();

        foreach ($result['breakdown'] as $item) {
            LeadScore::create([
                'lead_id' => $lead->id,
                'dimension' => $item['dimension'],
                'points_awarded' => $item['awarded_points'],
                'max_points' => $item['max_points'],
                'explanation' => $item['rationale'],
            ]);
        }

        $lead->update([
            'lead_score' => $result['total_score'],
            'score_breakdown' => $result,
        ]);

        return $lead->fresh(['scores', 'business', 'websiteAnalysis', 'aiOpportunities']);
    }

    /**
     * Dimension 1: Technical Health (Max 25 pts)
     *
     * @return array{dimension: string, awarded_points: int, max_points: int, rationale: string}
     */
    private function calculateTechnicalHealth(bool $hasWebsite, ?array $analysis): array
    {
        if (! $hasWebsite || empty($analysis)) {
            return [
                'dimension' => 'Technical Health',
                'awarded_points' => 0,
                'max_points' => 25,
                'rationale' => 'No active website detected; critical technical deficit indicates strong demand for new web build.',
            ];
        }

        $points = 0;
        $reasons = [];

        // SSL (8 pts)
        if (!empty($analysis['is_ssl_active'])) {
            $points += 8;
            $reasons[] = 'Valid SSL encryption (+8)';
        } else {
            $reasons[] = 'Missing SSL certificate (0)';
        }

        // Response Latency / TTFB (8 pts)
        $latency = (int) ($analysis['load_time_ms'] ?? 2000);
        if ($latency < 800) {
            $points += 8;
            $reasons[] = "Fast TTFB {$latency}ms (+8)";
        } elseif ($latency < 1500) {
            $points += 5;
            $reasons[] = "Acceptable latency {$latency}ms (+5)";
        } elseif ($latency < 3000) {
            $points += 2;
            $reasons[] = "Slow response {$latency}ms (+2)";
        } else {
            $reasons[] = "Critical latency {$latency}ms (0)";
        }

        // Mobile Viewport (6 pts)
        if (!empty($analysis['is_mobile_responsive'])) {
            $points += 6;
            $reasons[] = 'Mobile viewport configured (+6)';
        } else {
            $reasons[] = 'No mobile viewport meta tag (0)';
        }

        // Security Headers (3 pts)
        $secHeaders = $analysis['raw_signals']['technical']['security_headers'] ?? [];
        if (!empty($secHeaders['hsts']) || !empty($secHeaders['x_content_type_options'])) {
            $points += 3;
            $reasons[] = 'Security headers present (+3)';
        } else {
            $reasons[] = 'No security headers (0)';
        }

        return [
            'dimension' => 'Technical Health',
            'awarded_points' => min(25, $points),
            'max_points' => 25,
            'rationale' => implode(', ', $reasons) . '.',
        ];
    }

    /**
     * Dimension 2: SEO Visibility (Max 25 pts)
     *
     * @return array{dimension: string, awarded_points: int, max_points: int, rationale: string}
     */
    private function calculateSeoVisibility(bool $hasWebsite, ?array $analysis): array
    {
        if (! $hasWebsite || empty($analysis)) {
            return [
                'dimension' => 'SEO Visibility',
                'awarded_points' => 0,
                'max_points' => 25,
                'rationale' => 'No website present; zero search engine visibility and SERP snippet indexing.',
            ];
        }

        $points = 0;
        $reasons = [];

        // Meta Description (7 pts)
        if (!empty($analysis['has_meta_description'])) {
            $points += 7;
            $reasons[] = 'Meta description present (+7)';
        } else {
            $reasons[] = 'Missing meta description (0)';
        }

        // OpenGraph Social Cards (6 pts)
        if (!empty($analysis['has_open_graph'])) {
            $points += 6;
            $reasons[] = 'OpenGraph tags active (+6)';
        } else {
            $reasons[] = 'Missing OpenGraph metadata (0)';
        }

        // Schema.org Structured Data (7 pts)
        if (!empty($analysis['has_schema_markup'])) {
            $points += 7;
            $reasons[] = 'Structured JSON-LD schema (+7)';
        } else {
            $reasons[] = 'Missing LocalBusiness schema (0)';
        }

        // H1 Heading Hierarchy (5 pts)
        $h1Tags = $analysis['h1_tags'] ?? [];
        if (!empty($h1Tags)) {
            $points += 5;
            $reasons[] = 'H1 hierarchy verified (+5)';
        } else {
            $reasons[] = 'Missing H1 heading tag (0)';
        }

        return [
            'dimension' => 'SEO Visibility',
            'awarded_points' => min(25, $points),
            'max_points' => 25,
            'rationale' => implode(', ', $reasons) . '.',
        ];
    }

    /**
     * Dimension 3: Conversion Infrastructure (Max 25 pts)
     *
     * @return array{dimension: string, awarded_points: int, max_points: int, rationale: string}
     */
    private function calculateConversionInfrastructure(bool $hasWebsite, ?array $analysis): array
    {
        if (! $hasWebsite || empty($analysis)) {
            return [
                'dimension' => 'Conversion Deficits',
                'awarded_points' => 0,
                'max_points' => 25,
                'rationale' => 'No digital conversion infrastructure or online lead capture mechanism.',
            ];
        }

        $points = 0;
        $reasons = [];

        // Primary CTA Button (6 pts)
        if (!empty($analysis['has_cta'])) {
            $points += 6;
            $reasons[] = 'Primary CTA present (+6)';
        } else {
            $reasons[] = 'Missing CTA button (0)';
        }

        // Contact Form (6 pts)
        if (!empty($analysis['has_contact_form'])) {
            $points += 6;
            $reasons[] = 'Interactive contact form (+6)';
        } else {
            $reasons[] = 'Missing lead capture form (0)';
        }

        // Direct tel: Phone Link (5 pts)
        if (!empty($analysis['has_tel_links'])) {
            $points += 5;
            $reasons[] = 'Click-to-call tel: links (+5)';
        } else {
            $reasons[] = 'Unlinked telephone (0)';
        }

        // WhatsApp Chat Trigger (4 pts)
        if (!empty($analysis['has_whatsapp_chat'])) {
            $points += 4;
            $reasons[] = 'WhatsApp chat active (+4)';
        } else {
            $reasons[] = 'Missing WhatsApp chat (0)';
        }

        // Online Booking Embed (4 pts)
        if (!empty($analysis['has_booking_embed'])) {
            $points += 4;
            $reasons[] = 'Automated calendar booking (+4)';
        } else {
            $reasons[] = 'No booking embed detected (0)';
        }

        return [
            'dimension' => 'Conversion Deficits',
            'awarded_points' => min(25, $points),
            'max_points' => 25,
            'rationale' => implode(', ', $reasons) . '.',
        ];
    }

    /**
     * Dimension 4: Local Reputation & Authority (Max 25 pts)
     *
     * @param array<string, mixed> $businessData
     * @return array{dimension: string, awarded_points: int, max_points: int, rationale: string}
     */
    private function calculateLocalReputation(array $businessData): array
    {
        $points = 0;
        $reasons = [];

        // Verification & Phone (5 pts)
        $hasPlaceId = !empty($businessData['google_place_id']);
        $hasPhone = !empty($businessData['phone_number']);
        if ($hasPlaceId && $hasPhone) {
            $points += 5;
            $reasons[] = 'Verified Google Place entity with telephone (+5)';
        } elseif ($hasPlaceId) {
            $points += 3;
            $reasons[] = 'Verified Google Place entity without telephone (+3)';
        } else {
            $reasons[] = 'Unverified local entity (0)';
        }

        // Review Count (10 pts)
        $reviews = (int) ($businessData['review_count'] ?? 0);
        if ($reviews >= 50) {
            $points += 10;
            $reasons[] = "Strong social proof with {$reviews} reviews (+10)";
        } elseif ($reviews >= 20) {
            $points += 7;
            $reasons[] = "Moderate social proof with {$reviews} reviews (+7)";
        } elseif ($reviews >= 5) {
            $points += 4;
            $reasons[] = "Low review volume with {$reviews} reviews (+4)";
        } elseif ($reviews >= 1) {
            $points += 2;
            $reasons[] = "Nascent review profile with {$reviews} reviews (+2)";
        } else {
            $reasons[] = 'Zero reviews recorded (0)';
        }

        // Star Rating (10 pts)
        $rating = (float) ($businessData['rating'] ?? 0.0);
        if ($rating >= 4.5) {
            $points += 10;
            $reasons[] = "Superb rating of {$rating} stars (+10)";
        } elseif ($rating >= 4.0) {
            $points += 7;
            $reasons[] = "Solid rating of {$rating} stars (+7)";
        } elseif ($rating >= 3.5) {
            $points += 4;
            $reasons[] = "Mediocre rating of {$rating} stars (+4)";
        } elseif ($rating > 0.0) {
            $points += 1;
            $reasons[] = "Sub-optimal rating of {$rating} stars (+1)";
        } else {
            $reasons[] = 'No star rating available (0)';
        }

        return [
            'dimension' => 'Local Reputation',
            'awarded_points' => min(25, $points),
            'max_points' => 25,
            'rationale' => implode(', ', $reasons) . '.',
        ];
    }
}
