<?php

declare(strict_types=1);

namespace App\Domain\WebsiteAnalysis\Services;

use App\Domain\WebsiteAnalysis\DTOs\SafeFetchResult;
use App\Domain\WebsiteAnalysis\Exceptions\SecurityViolationException;
use Exception;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SafeWebsiteFetcher
{
    public const USER_AGENT = 'LeadMapBot/1.0 (+https://leadmap.ai/bot)';
    public const MAX_REDIRECTS = 3;
    public const TIMEOUT_SECONDS = 10;
    public const CONNECT_TIMEOUT_SECONDS = 5;
    public const MAX_BODY_BYTES = 5242880; // 5 MB

    public function __construct(
        private readonly SsrfProtectionService $ssrfProtection
    ) {
    }

    /**
     * Fetch a website safely with strict SSRF checks on initial URL and all redirects.
     *
     * @throws SecurityViolationException
     * @throws RuntimeException
     */
    public function fetch(string $url): SafeFetchResult
    {
        $currentUrl = $this->ssrfProtection->validateUrl($url);
        $originalUrl = $currentUrl;
        $redirectCount = 0;
        $startTime = microtime(true);

        while (true) {
            try {
                $response = Http::withUserAgent(self::USER_AGENT)
                    ->withoutRedirecting()
                    ->timeout(self::TIMEOUT_SECONDS)
                    ->connectTimeout(self::CONNECT_TIMEOUT_SECONDS)
                    ->withHeaders([
                        'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language' => 'en-US,en;q=0.9',
                    ])
                    ->get($currentUrl);
            } catch (Exception $e) {
                throw new RuntimeException("HTTP request failed for {$currentUrl}: {$e->getMessage()}", 0, $e);
            }

            $status = $response->status();

            // Handle HTTP redirects (301, 302, 303, 307, 308)
            if ($response->redirect()) {
                $redirectCount++;
                if ($redirectCount > self::MAX_REDIRECTS) {
                    throw new RuntimeException("Maximum redirect depth (" . self::MAX_REDIRECTS . ") exceeded for {$originalUrl}");
                }

                $location = $response->header('Location');
                if (empty($location)) {
                    throw new RuntimeException("Received redirect status {$status} without Location header from {$currentUrl}");
                }

                $resolvedUrl = $this->resolveRedirectUrl($location, $currentUrl);

                // SSRF validation MUST run on target of redirect
                $currentUrl = $this->ssrfProtection->validateUrl($resolvedUrl);
                continue;
            }

            // Normal response reached
            $endTime = microtime(true);
            $loadTimeMs = (int) round(($endTime - $startTime) * 1000);

            $rawBody = $response->body();
            if (strlen($rawBody) > self::MAX_BODY_BYTES) {
                $rawBody = substr($rawBody, 0, self::MAX_BODY_BYTES);
            }

            $isSsl = str_starts_with(strtolower($currentUrl), 'https://');

            return new SafeFetchResult(
                originalUrl: $originalUrl,
                finalUrl: $currentUrl,
                httpStatus: $status,
                loadTimeMs: $loadTimeMs,
                isSslActive: $isSsl,
                html: $rawBody,
                headers: $response->headers()
            );
        }
    }

    /**
     * Resolve a redirect Location header against the current URL.
     */
    private function resolveRedirectUrl(string $location, string $currentUrl): string
    {
        $trimmedLoc = trim($location);

        if (preg_match('#^https?://#i', $trimmedLoc)) {
            return $trimmedLoc;
        }

        $parsed = parse_url($currentUrl);
        $scheme = $parsed['scheme'] ?? 'https';
        $host = $parsed['host'] ?? '';
        $port = isset($parsed['port']) ? ':' . $parsed['port'] : '';
        $base = "{$scheme}://{$host}{$port}";

        if (str_starts_with($trimmedLoc, '//')) {
            return "{$scheme}:{$trimmedLoc}";
        }

        if (str_starts_with($trimmedLoc, '/')) {
            return "{$base}{$trimmedLoc}";
        }

        $currentPath = $parsed['path'] ?? '/';
        $dir = rtrim(dirname($currentPath), '/');
        $prefix = $dir === '' || $dir === '.' ? '' : $dir;

        return "{$base}{$prefix}/{$trimmedLoc}";
    }
}
