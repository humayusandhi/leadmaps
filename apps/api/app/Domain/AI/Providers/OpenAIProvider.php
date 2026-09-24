<?php

declare(strict_types=1);

namespace App\Domain\AI\Providers;

use App\Domain\AI\Contracts\AIProviderInterface;
use App\Domain\AI\Services\AIOpportunitySchemaValidator;
use App\Domain\Lead\Models\Lead;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIProvider implements AIProviderInterface
{
    public const MODEL_NAME = 'gpt-4o';
    public const PROMPT_VERSION = 'v1.0';

    public function __construct(
        private readonly AIOpportunitySchemaValidator $validator,
        private readonly MockAIProvider $fallbackProvider
    ) {
    }

    public function analyze(object $lead, array $signals): array
    {
        $apiKey = config('services.openai.api_key') ?: config('services.openai.key');

        if (empty($apiKey)) {
            Log::info("No OpenAI API key configured. Falling back to MockAIProvider for Lead [{$lead->id}].");
            return $this->fallbackProvider->analyze($lead, $signals);
        }

        $systemPrompt = <<<PROMPT
You are LeadMap AI, an elite B2B sales intelligence engine for digital agencies and consultants.
Analyze the provided business profile and technical crawler findings.
Extract 3 to 5 high-leverage sales opportunities where an agency could sell modern web, conversion, SEO, or software services.
Every single opportunity MUST cite direct evidence from the findings and recommend a concrete agency service.
Return ONLY a valid JSON object matching this schema:
{
  "opportunities": [
    {
      "category": "WEBSITE" | "SEO" | "LOCAL_SEO" | "CONVERSION" | "BOOKING" | "WHATSAPP" | "PERFORMANCE",
      "title": "Short descriptive opportunity title (max 80 chars)",
      "evidence": "Direct quote or verifiable technical observation from the provided signals",
      "suggested_service": "Concrete agency service package (e.g. Turnkey Online Booking Setup)",
      "confidence": "HIGH" | "MEDIUM" | "LOW",
      "points_estimated": 15
    }
  ]
}
PROMPT;

        $userPayload = [
            'business' => [
                'name' => $lead->business?->name,
                'address' => $lead->business?->formatted_address,
                'rating' => $lead->business?->rating,
                'review_count' => $lead->business?->review_count,
                'phone' => $lead->business?->phone_number,
                'website' => $lead->business?->website_url,
            ],
            'technical_signals' => $signals,
        ];

        try {
            $response = Http::withToken($apiKey)
                ->timeout(25)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => self::MODEL_NAME,
                    'response_format' => ['type' => 'json_object'],
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => json_encode($userPayload, JSON_THROW_ON_ERROR)],
                    ],
                    'temperature' => 0.2,
                ]);

            if (! $response->successful()) {
                Log::warning("OpenAI API call returned status {$response->status()}: {$response->body()}. Using fallback.");
                return $this->fallbackProvider->analyze($lead, $signals);
            }

            $body = $response->json();
            $content = $body['choices'][0]['message']['content'] ?? '{}';
            $parsed = json_decode($content, true) ?: [];

            $sanitizedOpportunities = $this->validator->validate($parsed);

            $usage = $body['usage'] ?? [];

            return [
                'opportunities' => $sanitizedOpportunities,
                'model_used' => self::MODEL_NAME,
                'prompt_version' => self::PROMPT_VERSION,
                'tokens_prompt' => (int) ($usage['prompt_tokens'] ?? 0),
                'tokens_completion' => (int) ($usage['completion_tokens'] ?? 0),
                'raw_output' => $parsed,
            ];
        } catch (Exception $e) {
            Log::error("OpenAIProvider failed: {$e->getMessage()}. Gracefully defaulting to MockAIProvider.");
            return $this->fallbackProvider->analyze($lead, $signals);
        }
    }
}
