<?php

declare(strict_types=1);

namespace App\Domain\Business\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchResult extends Model
{
    use HasUuids;

    protected $table = 'search_results';

    protected $fillable = [
        'search_id',
        'business_id',
        'rank',
    ];

    protected $casts = [
        'rank' => 'integer',
    ];

    public function search(): BelongsTo
    {
        return $this->belongsTo(Search::class);
    }

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }
}
