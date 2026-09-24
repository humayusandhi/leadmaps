<?php

declare(strict_types=1);

namespace App\Domain\WebsiteAnalysis\Services;

use App\Domain\WebsiteAnalysis\DTOs\SafeFetchResult;

class TechnicalSignalExtractor
{
    /**
     * Extract technical signals from fetch result.
     *
     * @return array{
     *     http_status: int,
     *     load_time_ms: int,
     *     is_ssl_active: bool,
     *     is_mobile_responsive: bool,
     *     security_headers: array<string, bool>
     * }
     */
    public function extract(SafeFetchResult $result): array
    {
        $html = $result->html;
        $headers = array_change_key_case($result->headers, CASE_LOWER);

        $isMobileResponsive = $this->checkMobileResponsive($html);

        $securityHeaders = [
            'hsts' => isset($headers['strict-transport-security']),
            'x_content_type_options' => isset($headers['x-content-type-options']),
            'x_frame_options' => isset($headers['x-frame-options']),
            'content_security_policy' => isset($headers['content-security-policy']),
        ];

        return [
            'http_status' => $result->httpStatus,
            'load_time_ms' => $result->loadTimeMs,
            'is_ssl_active' => $result->isSslActive,
            'is_mobile_responsive' => $isMobileResponsive,
            'security_headers' => $securityHeaders,
        ];
    }

    /**
     * Check if HTML contains a mobile viewport meta tag.
     */
    private function checkMobileResponsive(string $html): bool
    {
        if (preg_match('/<meta[^>]+name=["\']viewport["\'][^>]*>/i', $html, $matches)) {
            $tag = $matches[0];
            return (bool) preg_match('/content=["\'][^"\']*(width=device-width|initial-scale=1)[^"\']*["\']/i', $tag);
        }

        return false;
    }
}
