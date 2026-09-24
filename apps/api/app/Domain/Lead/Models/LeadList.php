<?php

declare(strict_types=1);

namespace App\Domain\Lead\Models;

use App\Domain\Workspace\Models\Workspace;
use App\Domain\Workspace\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeadList extends Model
{
    use HasUuids;
    use BelongsToTenant;

    protected $table = 'lead_lists';

    protected $fillable = [
        'workspace_id',
        'name',
        'description',
        'color',
        'icon',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(LeadListItem::class, 'lead_list_id');
    }

    public function leads(): BelongsToMany
    {
        return $this->belongsToMany(Lead::class, 'lead_list_items', 'lead_list_id', 'lead_id')
            ->withTimestamps();
    }
}
