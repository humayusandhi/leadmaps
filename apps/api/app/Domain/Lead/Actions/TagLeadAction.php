<?php

declare(strict_types=1);

namespace App\Domain\Lead\Actions;

use App\Domain\Lead\Models\Lead;
use App\Domain\Lead\Models\Tag;

class TagLeadAction
{
    public function execute(Lead $lead, string $tagName, ?string $color = '#10B981'): Tag
    {
        $workspaceId = $lead->workspace_id;
        $name = trim($tagName);

        $tag = Tag::withoutGlobalScopes()->firstOrCreate(
            [
                'workspace_id' => $workspaceId,
                'name' => $name,
            ],
            [
                'color' => $color ?: '#10B981',
            ]
        );

        if (! $lead->tags()->where('tags.id', $tag->id)->exists()) {
            $lead->tags()->attach($tag->id);
        }

        return $tag;
    }
}
