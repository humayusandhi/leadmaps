<?php

declare(strict_types=1);

namespace App\Domain\AI\Models;

use App\Domain\Lead\Models\Lead;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiOpportunity extends Model
{
    use HasUuids;

    protected $table = 'ai_opportunities';

    protected $fillable = [
        'ai_analysis_id',
        'lead_id',
        'category',
        'title',
        'evidence',
        'suggested_service',
        'confidence',
        'points_estimated',
    ];

    protected $casts = [
        'points_estimated' => 'integer',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }

    public function analysis(): BelongsTo
    {
        return $this->belongsTo(AiAnalysis::class, 'ai_analysis_id');
    }
}
