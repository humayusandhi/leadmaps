<?php

declare(strict_types=1);

namespace App\Domain\AI\Actions;

use App\Domain\AI\Models\AiOutreachDraft;
use App\Domain\AI\Services\OutreachSynthesizerService;
use App\Domain\Lead\Models\Lead;

class GenerateOutreachDraftAction
{
    public function __construct(
        private readonly OutreachSynthesizerService $synthesizer
    ) {}

    /**
     * Execute multi-channel outreach draft synthesis and store in database.
     *
     * @param Lead $lead
     * @return array<string, AiOutreachDraft>
     */
    public function execute(Lead $lead): array
    {
        $draftData = $this->synthesizer->synthesizeAll($lead);
        $results = [];

        foreach ($draftData as $channel => $data) {
            $draft = AiOutreachDraft::updateOrCreate(
                [
                    'lead_id' => $lead->id,
                    'channel' => $channel,
                ],
                [
                    'workspace_id' => $lead->workspace_id,
                    'subject' => $data['subject'],
                    'body' => $data['body'],
                    'status' => 'draft',
                    'tokens_used' => $data['tokens_used'],
                    'metadata' => $data['metadata'],
                ]
            );

            $results[$channel] = $draft;
        }

        return $results;
    }
}
