<?php

declare(strict_types=1);

namespace Tests\Unit;

require_once __DIR__ . '/../../app/Domain/WebsiteAnalysis/Exceptions/SecurityViolationException.php';
require_once __DIR__ . '/../../app/Domain/WebsiteAnalysis/Services/SsrfProtectionService.php';

use App\Domain\WebsiteAnalysis\Exceptions\SecurityViolationException;
use App\Domain\WebsiteAnalysis\Services\SsrfProtectionService;

class SsrfProtectionServiceTest
{
    public static function run(): void
    {
        echo "Running SsrfProtectionServiceTest...\n";
        $service = new SsrfProtectionService();

        // 1. Protocol Scheme Filtering
        $disallowedSchemes = [
            'file:///etc/passwd',
            'gopher://127.0.0.1:6379/_',
            'ftp://anonymous@ftp.example.com',
            'dict://dict.org',
            'php://filter/read=convert.base64-encode/resource=index.php',
            'data:text/html,<script>alert(1)</script>',
        ];

        foreach ($disallowedSchemes as $badUrl) {
            $threw = false;
            try {
                $service->validateUrl($badUrl);
            } catch (SecurityViolationException $e) {
                $threw = true;
            }
            assert($threw === true, "Must throw SecurityViolationException for disallowed scheme: {$badUrl}");
        }

        // 2. Forbidden Port Filtering
        $forbiddenPorts = [
            'http://example.com:22',
            'http://example.com:25',
            'http://example.com:3306',
            'http://example.com:5432',
            'http://example.com:6379',
            'http://example.com:27017',
        ];

        foreach ($forbiddenPorts as $badPortUrl) {
            $threw = false;
            try {
                $service->validateUrl($badPortUrl);
            } catch (SecurityViolationException $e) {
                $threw = true;
            }
            assert($threw === true, "Must throw SecurityViolationException for forbidden port: {$badPortUrl}");
        }

        // 3. Prohibited Internal Hostnames
        $prohibitedHosts = [
            'http://localhost',
            'http://test.localhost',
            'http://api.internal',
            'http://corp.local',
            'http://metadata.google.internal',
        ];

        foreach ($prohibitedHosts as $badHost) {
            $threw = false;
            try {
                $service->validateUrl($badHost);
            } catch (SecurityViolationException $e) {
                $threw = true;
            }
            assert($threw === true, "Must throw SecurityViolationException for internal host: {$badHost}");
        }

        // 4. IP Blacklist & CIDR Validation
        $blacklistedIps = [
            '127.0.0.1',
            '127.0.0.5',
            '10.0.0.1',
            '10.255.255.254',
            '172.16.0.1',
            '172.31.255.255',
            '192.168.0.1',
            '192.168.1.254',
            '169.254.169.254', // AWS / GCP metadata
            '169.254.1.1',
            '0.0.0.0',
            '255.255.255.255',
            '::1',
            '::ffff:127.0.0.1',
            '::ffff:192.168.1.1',
        ];

        foreach ($blacklistedIps as $ip) {
            $threw = false;
            try {
                $service->validateIp($ip);
            } catch (SecurityViolationException $e) {
                $threw = true;
            }
            assert($threw === true, "Must throw SecurityViolationException for blacklisted IP: {$ip}");
        }

        // 5. Allowed Public IPv4
        $validPublicIps = [
            '93.184.216.34',  // example.com
            '8.8.8.8',
            '1.1.1.1',
        ];

        foreach ($validPublicIps as $publicIp) {
            $service->validateIp($publicIp); // Must not throw
        }

        echo "SsrfProtectionServiceTest passed successfully! (100% assertions satisfied)\n";
    }
}

if (php_sapi_name() === 'cli' && realpath($argv[0]) === realpath(__FILE__)) {
    SsrfProtectionServiceTest::run();
}
