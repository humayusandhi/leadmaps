<?php

declare(strict_types=1);

namespace App\Domain\Lead\Actions;

use App\Domain\Lead\Models\Lead;
use App\Domain\Lead\Models\LeadNote;

class AddLeadNoteAction
{
    public function execute(Lead $lead, string $userId, string $content): LeadNote
    {
        return LeadNote::create([
            'lead_id' => $lead->id,
            'user_id' => $userId,
            'content' => trim($content),
        ])->load('user');
    }
}
