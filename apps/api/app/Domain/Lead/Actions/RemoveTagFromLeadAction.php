<?php

declare(strict_types=1);

namespace App\Domain\Lead\Actions;

use App\Domain\Lead\Models\Lead;

class RemoveTagFromLeadAction
{
    public function execute(Lead $lead, string $tagId): void
    {
        $lead->tags()->detach($tagId);
    }
}
