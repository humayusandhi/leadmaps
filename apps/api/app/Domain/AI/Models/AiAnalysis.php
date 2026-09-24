<?php

declare(strict_types=1);

namespace App\Domain\AI\Models;

use App\Domain\Lead\Models\Lead;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiAnalysis extends Model
{
    use HasUuids;

    protected $table = 'ai_analyses';

    protected $fillable = [
        'lead_id',
        'model_used',
        'prompt_version',
        'tokens_prompt',
        'tokens_completion',
        'raw_output',
    ];

    protected $casts = [
        'tokens_prompt' => 'integer',
        'tokens_completion' => 'integer',
        'raw_output' => 'array',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function opportunities(): HasMany
    {
        return $this->hasMany(AiOpportunity::class);
    }
}
