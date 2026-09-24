<?php

declare(strict_types=1);

namespace App\Domain\AI\Contracts;

use App\Domain\Lead\Models\Lead;

interface AIProviderInterface
{
    /**
     * Analyze a lead and its observed technical signals to extract structured sales opportunities.
     *
     * @param Lead $lead
     * @param array<string, mixed> $signals
     * @return array{
     *     opportunities: array<int, array{
     *         category: string,
     *         title: string,
     *         evidence: string,
     *         suggested_service: string,
     *         confidence: string,
     *         points_estimated: int
     *     }>,
     *     model_used: string,
     *     prompt_version: string,
     *     tokens_prompt: int,
     *     tokens_completion: int,
     *     raw_output: array<string, mixed>
     * }
     */
    public function analyze(object $lead, array $signals): array;
}
