<?php

declare(strict_types=1);

namespace App\Domain\Business\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Business extends Model
{
    use HasUuids;

    protected $table = 'businesses';

    protected $fillable = [
        'google_place_id',
        'name',
        'formatted_address',
        'city',
        'country',
        'phone_number',
        'website_url',
        'rating',
        'review_count',
        'latitude',
        'longitude',
        'raw_provider_payload',
    ];

    protected $casts = [
        'rating' => 'float',
        'review_count' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
        'raw_provider_payload' => 'array',
    ];

    public function searches(): BelongsToMany
    {
        return $this->belongsToMany(Search::class, 'search_results')
            ->withPivot(['id', 'rank'])
            ->withTimestamps();
    }
}
