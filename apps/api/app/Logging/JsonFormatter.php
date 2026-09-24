<?php

declare(strict_types=1);

namespace App\Logging;

use Monolog\Formatter\NormalizerFormatter;
use Monolog\LogRecord;

class JsonFormatter extends NormalizerFormatter
{
    /**
     * List of sensitive keys to redact from log contexts.
     *
     * @var array<int, string>
     */
    private const REDACTED_KEYS = [
        'password',
        'password_confirmation',
        'api_key',
        'token',
        'secret',
        'credentials',
        'authorization',
        'bearer',
        'razorpay_secret',
        'razorpay_signature',
        'card_number',
        'cvv',
    ];

    public function format(LogRecord $record): string
    {
        $normalized = $this->normalize($record->toArray());

        $requestId = request()->header('X-Request-ID')
            ?? (app()->has('current_request_id') ? app('current_request_id') : null)
            ?? 'req_sys_' . substr(md5((string) microtime(true)), 0, 12);

        $workspaceId = request()->header('X-Workspace-ID')
            ?? (app()->has('current_workspace_id') ? app('current_workspace_id') : null);

        $userId = auth()->id();

        $context = $this->redactSensitiveData($normalized['context'] ?? []);

        $structured = [
            'timestamp' => $record->datetime->format('c'),
            'level' => $record->level->getName(),
            'message' => $record->message,
            'channel' => $record->channel,
            'request_id' => $requestId,
            'workspace_id' => $workspaceId,
            'user_id' => $userId,
            'ip' => request()->ip() ?? '127.0.0.1',
            'context' => $context,
        ];

        if (!empty($normalized['extra'])) {
            $structured['extra'] = $this->redactSensitiveData($normalized['extra']);
        }

        return json_encode($structured, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
    }

    /**
     * Recursively redact sensitive keys from arrays.
     *
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function redactSensitiveData(array $data): array
    {
        foreach ($data as $key => $value) {
            $normalizedKey = strtolower((string) $key);
            $shouldRedact = false;

            foreach (self::REDACTED_KEYS as $redactedKey) {
                if (str_contains($normalizedKey, $redactedKey)) {
                    $shouldRedact = true;
                    break;
                }
            }

            if ($shouldRedact) {
                $data[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $data[$key] = $this->redactSensitiveData($value);
            }
        }

        return $data;
    }
}
