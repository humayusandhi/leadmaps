<?php

declare(strict_types=1);

namespace App\Domain\Business\Models;

use App\Domain\Auth\Models\User;
use App\Domain\Workspace\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Search extends Model
{
    use HasUuids;
    use BelongsToTenant;

    protected $table = 'searches';

    protected $fillable = [
        'workspace_id',
        'user_id',
        'query',
        'category',
        'location',
        'radius_km',
        'status',
        'total_results',
        'filters',
    ];

    protected $casts = [
        'radius_km' => 'integer',
        'total_results' => 'integer',
        'filters' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(SearchResult::class);
    }

    public function businesses(): BelongsToMany
    {
        return $this->belongsToMany(Business::class, 'search_results')
            ->withPivot(['id', 'rank'])
            ->withTimestamps()
            ->orderByPivot('rank', 'asc');
    }
}
