<?php

declare(strict_types=1);

namespace Tests\Feature;

// Mock Monolog LogRecord, Level, and Formatter if running standalone without composer autoloader
if (!class_exists('Monolog\Formatter\NormalizerFormatter')) {
    eval('
    namespace Monolog\Formatter {
        class NormalizerFormatter {
            protected function normalize(mixed $data, int $depth = 0): mixed {
                if (is_array($data)) {
                    $res = [];
                    foreach ($data as $k => $v) {
                        $res[$k] = $this->normalize($v, $depth + 1);
                    }
                    return $res;
                }
                return $data;
            }
        }
    }
    ');
}

if (!class_exists('Monolog\Level')) {
    eval('
    namespace Monolog {
        enum Level: int {
            case Debug = 100;
            case Info = 200;
            case Warning = 300;
            case Error = 400;

            public function getName(): string {
                return match($this) {
                    self::Debug => "DEBUG",
                    self::Info => "INFO",
                    self::Warning => "WARNING",
                    self::Error => "ERROR",
                };
            }
        }
    }
    ');
}

if (!class_exists('Monolog\LogRecord')) {
    eval('
    namespace Monolog {
        class LogRecord {
            public function __construct(
                public \DateTimeImmutable $datetime,
                public string $channel,
                public Level $level,
                public string $message,
                public array $context = [],
                public array $extra = []
            ) {}

            public function toArray(): array {
                return [
                    "message" => $this->message,
                    "context" => $this->context,
                    "level" => $this->level->value,
                    "level_name" => $this->level->getName(),
                    "channel" => $this->channel,
                    "datetime" => $this->datetime,
                    "extra" => $this->extra,
                ];
            }
        }
    }
    ');
}

require_once __DIR__ . '/../../app/Logging/JsonFormatter.php';
require_once __DIR__ . '/../../app/Http/Middleware/RequestCorrelationMiddleware.php';

use App\Logging\JsonFormatter;
use App\Http\Middleware\RequestCorrelationMiddleware;
use DateTimeImmutable;

// Stubs for Laravel helper functions if running outside full framework kernel
if (!function_exists('request')) {
    eval('
    class MockRequest {
        public array $headers = [];
        public function header(string $key, mixed $default = null): mixed {
            return $this->headers[$key] ?? $default;
        }
        public function ip(): string {
            return "192.168.1.100";
        }
    }
    function request(): MockRequest {
        static $req = null;
        if ($req === null) {
            $req = new MockRequest();
        }
        return $req;
    }
    ');
}

if (!function_exists('app')) {
    eval('
    class MockApp {
        private array $instances = [];
        public function has(string $key): bool {
            return isset($this->instances[$key]);
        }
        public function instance(string $key, mixed $val): void {
            $this->instances[$key] = $val;
        }
        public function get(string $key): mixed {
            return $this->instances[$key] ?? null;
        }
    }
    function app(?string $key = null): mixed {
        static $app = null;
        if ($app === null) {
            $app = new MockApp();
        }
        if ($key !== null) {
            return $app->get($key);
        }
        return $app;
    }
    ');
}

if (!function_exists('auth')) {
    eval('
    class MockAuth {
        public function id(): ?string {
            return "usr_test_01h9abcdef";
        }
    }
    function auth(): MockAuth {
        return new MockAuth();
    }
    ');
}

if (!function_exists('env')) {
    eval('
    function env(string $key, mixed $default = null): mixed {
        return $_ENV[$key] ?? $_SERVER[$key] ?? (getenv($key) !== false ? getenv($key) : $default);
    }
    ');
}

class LoggingAndCorrelationTest
{
    public static function run(): void
    {
        echo "Running LoggingAndCorrelationTest (Phase 10 - Structured JSON & Observability)...\n";

        self::testJsonFormatterStructureAndFormat();
        self::testSensitiveSecretRedactionInLogs();
        self::testNestedSecretRedaction();
        self::testRequestCorrelationIdGenerationAndPropagation();
        self::testSentryObservabilityConfigCompliance();

        echo "✓ All LoggingAndCorrelationTest tests passed successfully (100% assertions satisfied)!\n";
    }

    private static function testJsonFormatterStructureAndFormat(): void
    {
        echo "  - Testing Structured JSON Logging Output Format...\n";
        $formatter = new JsonFormatter();

        $record = new \Monolog\LogRecord(
            datetime: new DateTimeImmutable('2026-09-21T10:00:00Z'),
            channel: 'production',
            level: \Monolog\Level::Info,
            message: 'User completed discovery search query',
            context: [
                'query' => 'Dental clinics in Austin',
                'results_count' => 18,
                'duration_ms' => 412,
            ]
        );

        $jsonOutput = $formatter->format($record);
        assert(is_string($jsonOutput), 'Formatter must return a string');
        assert(str_ends_with($jsonOutput, "\n"), 'Formatter output must end with newline for streaming logs');

        $decoded = json_decode($jsonOutput, true);
        assert(is_array($decoded), 'Formatted output must be valid JSON');
        assert($decoded['level'] === 'INFO', 'Level must match log record level');
        assert($decoded['message'] === 'User completed discovery search query', 'Message must match record');
        assert($decoded['channel'] === 'production', 'Channel must match');
        assert(isset($decoded['timestamp']), 'Timestamp field must be present');
        assert(isset($decoded['request_id']), 'Request ID must be injected');
        assert(isset($decoded['context']['query']), 'Non-sensitive context must be preserved');
        assert($decoded['context']['results_count'] === 18, 'Context count must match');
    }

    private static function testSensitiveSecretRedactionInLogs(): void
    {
        echo "  - Testing Zero-Secret Leakage Redaction Filter...\n";
        $formatter = new JsonFormatter();

        $record = new \Monolog\LogRecord(
            datetime: new DateTimeImmutable(),
            channel: 'security',
            level: \Monolog\Level::Warning,
            message: 'Webhook received or auth attempt',
            context: [
                'username' => 'testuser@example.com',
                'password' => 'SuperSecret123!SafePass',
                'password_confirmation' => 'SuperSecret123!SafePass',
                'api_key' => 'riff_live_sec_1928374650192837465',
                'razorpay_secret' => 'rzp_sec_abcdef987654321',
                'bearer_token' => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                'card_number' => '4111222233334444',
                'cvv' => '999',
            ]
        );

        $jsonOutput = $formatter->format($record);
        $decoded = json_decode($jsonOutput, true);
        $context = $decoded['context'];

        assert($context['username'] === 'testuser@example.com', 'Username is safe and should remain intact');
        assert($context['password'] === '[REDACTED]', 'Plaintext password MUST be redacted');
        assert($context['password_confirmation'] === '[REDACTED]', 'Password confirmation MUST be redacted');
        assert($context['api_key'] === '[REDACTED]', 'API Key MUST be redacted');
        assert($context['razorpay_secret'] === '[REDACTED]', 'Razorpay Secret MUST be redacted');
        assert($context['bearer_token'] === '[REDACTED]', 'Bearer token MUST be redacted');
        assert($context['card_number'] === '[REDACTED]', 'Card number MUST be redacted');
        assert($context['cvv'] === '[REDACTED]', 'CVV MUST be redacted');

        // Verify that the secret strings do not appear anywhere in the raw formatted string
        assert(!str_contains($jsonOutput, 'SuperSecret123!SafePass'), 'Raw output must never leak passwords');
        assert(!str_contains($jsonOutput, '1928374650192837465'), 'Raw output must never leak API keys');
        assert(!str_contains($jsonOutput, 'rzp_sec_abcdef987654321'), 'Raw output must never leak webhook secrets');
    }

    private static function testNestedSecretRedaction(): void
    {
        echo "  - Testing Deeply Nested Secret Redaction...\n";
        $formatter = new JsonFormatter();

        $record = new \Monolog\LogRecord(
            datetime: new DateTimeImmutable(),
            channel: 'integrations',
            level: \Monolog\Level::Error,
            message: 'Failed to sync with third-party CRM',
            context: [
                'integration' => [
                    'provider' => 'RiffCRM',
                    'auth' => [
                        'credentials' => [
                            'secret_token' => 'tok_live_09871234abcd',
                        ],
                    ],
                ],
            ]
        );

        $jsonOutput = $formatter->format($record);
        $decoded = json_decode($jsonOutput, true);

        $credentials = $decoded['context']['integration']['auth']['credentials'];
        assert($credentials === '[REDACTED]' || (is_array($credentials) && $credentials['secret_token'] === '[REDACTED]'), 'Nested secret tokens must be redacted');
        assert(!str_contains($jsonOutput, 'tok_live_09871234abcd'), 'Nested token must never leak into log');
    }

    private static function testRequestCorrelationIdGenerationAndPropagation(): void
    {
        echo "  - Testing Request Correlation Middleware (X-Request-ID)...\n";

        // Verify that custom incoming header is preserved
        request()->headers['X-Request-ID'] = 'req_custom_tracer_99999';
        $formatter = new JsonFormatter();
        $record = new \Monolog\LogRecord(
            datetime: new DateTimeImmutable(),
            channel: 'app',
            level: \Monolog\Level::Info,
            message: 'Test correlation flow'
        );
        $json = $formatter->format($record);
        $decoded = json_decode($json, true);
        assert($decoded['request_id'] === 'req_custom_tracer_99999', 'Logger must extract and correlate incoming X-Request-ID');

        // Clear header to test fallback generation
        request()->headers['X-Request-ID'] = null;
        $jsonWithoutHeader = $formatter->format($record);
        $decodedFallback = json_decode($jsonWithoutHeader, true);
        assert(!empty($decodedFallback['request_id']), 'Logger must generate unique fallback request_id if header absent');
        assert(str_starts_with($decodedFallback['request_id'], 'req_sys_'), 'Fallback request ID prefix must be valid');
    }

    private static function testSentryObservabilityConfigCompliance(): void
    {
        echo "  - Testing Sentry Configuration & Privacy Compliance...\n";

        $sentryConfig = require __DIR__ . '/../../config/sentry.php';
        assert(is_array($sentryConfig), 'config/sentry.php must return array');
        assert(isset($sentryConfig['dsn']), 'Sentry DSN key must be declared');
        assert($sentryConfig['send_default_pii'] === false, 'Sentry send_default_pii MUST be false for privacy compliance');
        assert(isset($sentryConfig['traces_sample_rate']), 'Tracing sample rate must be configured');
        assert(isset($sentryConfig['ignore_exceptions']), 'Ignored common HTTP/validation exceptions must be configured');
    }
}

if (php_sapi_name() === 'cli') {
    LoggingAndCorrelationTest::run();
}
