<?php

declare(strict_types=1);

namespace App\Domain\AI\Models;

use App\Domain\Lead\Models\Lead;
use App\Domain\Workspace\Models\Workspace;
use App\Domain\Workspace\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiOutreachDraft extends Model
{
    use HasUuids;
    use BelongsToTenant;

    protected $table = 'ai_outreach_drafts';

    protected $fillable = [
        'workspace_id',
        'lead_id',
        'channel',
        'subject',
        'body',
        'status',
        'tokens_used',
        'metadata',
    ];

    protected $casts = [
        'tokens_used' => 'integer',
        'metadata' => 'array',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
