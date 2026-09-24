<?php

declare(strict_types=1);

namespace App\Domain\Lead\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadScore extends Model
{
    use HasUuids;

    protected $table = 'lead_scores';

    protected $fillable = [
        'lead_id',
        'dimension',
        'points_awarded',
        'max_points',
        'explanation',
    ];

    protected $casts = [
        'points_awarded' => 'integer',
        'max_points' => 'integer',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
