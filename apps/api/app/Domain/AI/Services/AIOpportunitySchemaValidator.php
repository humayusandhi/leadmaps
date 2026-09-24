<?php

declare(strict_types=1);

namespace App\Domain\AI\Services;

use InvalidArgumentException;

class AIOpportunitySchemaValidator
{
    public const ALLOWED_CATEGORIES = [
        'WEBSITE',
        'SEO',
        'LOCAL_SEO',
        'CONVERSION',
        'BOOKING',
        'WHATSAPP',
        'MOBILE',
        'PERFORMANCE',
        'ECOMMERCE',
        'CRM',
        'AUTOMATION',
        'DIGITAL_MARKETING',
        'SOFTWARE',
        'BRANDING',
        'UI_UX',
    ];

    public const ALLOWED_CONFIDENCE = ['HIGH', 'MEDIUM', 'LOW'];

    /**
     * Validate and sanitize opportunities array from raw AI output.
     *
     * @param array<string, mixed> $rawPayload
     * @return array<int, array{
     *     category: string,
     *     title: string,
     *     evidence: string,
     *     suggested_service: string,
     *     confidence: string,
     *     points_estimated: int
     * }>
     * @throws InvalidArgumentException
     */
    public function validate(array $rawPayload): array
    {
        $rawItems = $rawPayload['opportunities'] ?? $rawPayload;

        if (! is_array($rawItems)) {
            throw new InvalidArgumentException('AI output payload must contain an "opportunities" array.');
        }

        $sanitized = [];

        foreach ($rawItems as $idx => $item) {
            if (! is_array($item)) {
                continue;
            }

            $category = strtoupper(trim((string) ($item['category'] ?? 'WEBSITE')));
            if (! in_array($category, self::ALLOWED_CATEGORIES, true)) {
                $category = 'WEBSITE';
            }

            $title = trim((string) ($item['title'] ?? ''));
            if ($title === '') {
                continue;
            }
            $titleLen = function_exists('mb_strlen') ? mb_strlen($title) : strlen($title);
            if ($titleLen > 140) {
                $title = (function_exists('mb_substr') ? mb_substr($title, 0, 137) : substr($title, 0, 137)) . '...';
            }

            $evidence = trim((string) ($item['evidence'] ?? ''));
            if ($evidence === '') {
                continue;
            }

            $suggestedService = trim((string) ($item['suggested_service'] ?? ''));
            if ($suggestedService === '') {
                continue;
            }

            $confidence = strtoupper(trim((string) ($item['confidence'] ?? 'MEDIUM')));
            if (! in_array($confidence, self::ALLOWED_CONFIDENCE, true)) {
                $confidence = 'MEDIUM';
            }

            $pointsEstimated = (int) ($item['points_estimated'] ?? 15);
            $pointsEstimated = max(0, min(30, $pointsEstimated));

            $sanitized[] = [
                'category' => $category,
                'title' => $title,
                'evidence' => $evidence,
                'suggested_service' => $suggestedService,
                'confidence' => $confidence,
                'points_estimated' => $pointsEstimated,
            ];
        }

        if (empty($sanitized)) {
            throw new InvalidArgumentException('No valid opportunities could be extracted from AI payload.');
        }

        return $sanitized;
    }
}
