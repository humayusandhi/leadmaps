<?php

declare(strict_types=1);

namespace App\Domain\AI\Services;

use App\Domain\Lead\Models\Lead;

class OutreachSynthesizerService
{
    /**
     * Synthesize multi-channel outreach drafts for a lead based on observed technical signals and opportunities.
     *
     * @param Lead $lead
     * @return array<string, array{channel: string, subject: ?string, body: string, tokens_used: int, metadata: array<string, mixed>}>
     */
    public function synthesizeAll(object $lead): array
    {
        $business = $lead->business;
        $businessName = $business?->name ?? 'Local Business';
        $city = $business?->city ?? 'your area';
        $rating = $business?->rating ? number_format((float) $business->rating, 1) : '4.8';
        $reviewCount = $business?->reviews_count ?? 15;
        
        $analysis = $lead->websiteAnalysis;
        $opportunities = $lead->aiOpportunities ?? [];

        // Extract primary opportunity or fallback to observed signals
        $primaryOpp = ! empty($opportunities) && count($opportunities) > 0 ? $opportunities[0] : null;
        $primaryDeficit = $this->determinePrimaryDeficit($analysis, $primaryOpp);
        $suggestedService = $primaryOpp?->suggested_service ?? $primaryDeficit['service'];

        return [
            'email' => $this->draftEmail($businessName, $city, $rating, $reviewCount, $primaryDeficit, $suggestedService, $lead->id),
            'whatsapp' => $this->draftWhatsApp($businessName, $rating, $primaryDeficit, $lead->id),
            'linkedin' => $this->draftLinkedIn($businessName, $city, $primaryDeficit, $suggestedService),
        ];
    }

    /**
     * Determine primary deficit and opportunity angle.
     *
     * @param mixed $analysis
     * @param mixed $opportunity
     * @return array{issue: string, impact: string, service: string}
     */
    private function determinePrimaryDeficit(mixed $analysis, mixed $opportunity): array
    {
        if ($opportunity) {
            return [
                'issue' => $opportunity->title ?? 'Digital conversion deficit',
                'impact' => $opportunity->evidence ?? 'Detected unoptimized visitor touchpoints on your site',
                'service' => $opportunity->suggested_service ?? 'Conversion rate & website modernization',
            ];
        }

        if ($analysis) {
            if (! empty($analysis->load_time_ms) && $analysis->load_time_ms > 2500) {
                return [
                    'issue' => "page load latency ({$analysis->load_time_ms}ms)",
                    'impact' => 'Slow mobile speed causes over 40% of local visitors to bounce before calling',
                    'service' => 'Core Web Vitals performance optimization',
                ];
            }

            if (isset($analysis->is_mobile_responsive) && ! $analysis->is_mobile_responsive) {
                return [
                    'issue' => 'unresponsive mobile layout',
                    'impact' => 'Mobile visitors cannot easily tap your phone number or navigate services',
                    'service' => 'Mobile-first responsive redesign',
                ];
            }

            if (isset($analysis->has_ssl_active) && ! $analysis->has_ssl_active) {
                return [
                    'issue' => 'missing HTTPS / SSL certificate',
                    'impact' => 'Browsers trigger "Not Secure" warnings, damaging brand credibility',
                    'service' => 'Security compliance & SSL configuration',
                ];
            }

            if (isset($analysis->has_booking_embed) && ! $analysis->has_booking_embed) {
                return [
                    'issue' => 'lack of online booking or direct quote widget',
                    'impact' => 'High-intent after-hours prospects cannot instantly schedule appointments',
                    'service' => 'Automated online booking & lead capture integration',
                ];
            }
        }

        return [
            'issue' => 'missed digital lead capture mechanisms',
            'impact' => 'Local competitors with instant click-to-chat widgets are capturing market share',
            'service' => 'Local SEO & high-converting lead funnel setup',
        ];
    }

    /**
     * Draft Email outreach: Subject line + 3-paragraph value proposition.
     *
     * @return array{channel: string, subject: string, body: string, tokens_used: int, metadata: array<string, mixed>}
     */
    public function draftEmail(
        string $businessName,
        string $city,
        string $rating,
        int $reviewCount,
        array $deficit,
        string $service,
        string $leadId
    ): array {
        $subject = "Quick observation regarding {$businessName}'s website ({$city})";

        $p1 = "Hi {$businessName} team,\n\nI recently came across your business while researching high-rated local leaders in {$city} (congrats on maintaining a solid {$rating}★ rating across {$reviewCount} Google reviews). Out of curiosity, I ran a brief technical diagnostic on your website and noticed a key area holding back your inbound inquiries: {$deficit['issue']}.";

        $p2 = "Specifically, {$deficit['impact']}. In our experience working with similar businesses in {$city}, resolving this via {$service} routinely unlocks a 20–35% lift in booked appointments and direct phone calls from existing organic traffic.";

        $p3 = "I put together a quick 3-minute screen audit detailing the exact lines to adjust. Would you be open to a 5-minute chat this Thursday at 10 AM, or should I send over the private video link first?\n\nBest regards,\nGrowth Engineering Team";

        $body = "{$p1}\n\n{$p2}\n\n{$p3}";

        return [
            'channel' => 'email',
            'subject' => $subject,
            'body' => $body,
            'tokens_used' => 280,
            'metadata' => [
                'rating_cited' => $rating,
                'reviews_cited' => $reviewCount,
                'deficit_cited' => $deficit['issue'],
                'service_suggested' => $service,
            ],
        ];
    }

    /**
     * Draft WhatsApp outreach: Highly personalized, strictly capped at <= 400 characters.
     *
     * @return array{channel: string, subject: null, body: string, tokens_used: int, metadata: array<string, mixed>}
     */
    public function draftWhatsApp(
        string $businessName,
        string $rating,
        array $deficit,
        string $leadId
    ): array {
        $issueText = $deficit['issue'] ?? 'your website conversion funnel';
        $issueSnippet = function_exists('mb_substr') ? mb_substr($issueText, 0, 45) : substr($issueText, 0, 45);
        $body = "Hi {$businessName}! Impressed by your {$rating}★ reviews on Maps. Ran a quick check on your website and noticed an issue with {$issueSnippet} that could be leaking inquiries. Put together a 2-min breakdown on how to fix it: leadmap.io/d/{$leadId}. Worth a quick 3-min chat this week?";

        // Strict validation: Must not exceed 400 characters
        $len = function_exists('mb_strlen') ? mb_strlen($body) : strlen($body);
        if ($len > 400) {
            $body = (function_exists('mb_substr') ? mb_substr($body, 0, 397) : substr($body, 0, 397)) . '...';
            $len = function_exists('mb_strlen') ? mb_strlen($body) : strlen($body);
        }

        return [
            'channel' => 'whatsapp',
            'subject' => null,
            'body' => $body,
            'tokens_used' => 95,
            'metadata' => [
                'char_count' => $len,
                'max_chars' => 400,
            ],
        ];
    }

    /**
     * Draft LinkedIn InMail outreach: Executive B2B angle.
     *
     * @return array{channel: string, subject: string, body: string, tokens_used: int, metadata: array<string, mixed>}
     */
    public function draftLinkedIn(
        string $businessName,
        string $city,
        array $deficit,
        string $service
    ): array {
        $subject = "Digital audit insight for {$businessName}";

        $body = "Hi there,\n\nI've been following {$businessName}'s market presence in {$city} and wanted to reach out directly. While benchmarking local digital customer journeys, our automated intelligence engine flagged an optimization deficit on your web properties—namely {$deficit['issue']}.\n\nWe specialize in {$service} for high-growth local brands, typically increasing qualified inbound conversions without increasing ad spend.\n\nOpen to connecting here on LinkedIn or reviewing our executive summary deck?\n\nBest,\nLead Intelligence Director";

        return [
            'channel' => 'linkedin',
            'subject' => $subject,
            'body' => $body,
            'tokens_used' => 190,
            'metadata' => [
                'service_suggested' => $service,
                'target_market' => $city,
            ],
        ];
    }
}
