<?php

declare(strict_types=1);

namespace App\Domain\Lead\Models;

use App\Domain\Workspace\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasUuids;
    use BelongsToTenant;

    protected $table = 'tags';

    protected $fillable = [
        'workspace_id',
        'name',
        'color',
    ];

    public function leads(): BelongsToMany
    {
        return $this->belongsToMany(Lead::class, 'lead_tags')
            ->withTimestamps();
    }
}
