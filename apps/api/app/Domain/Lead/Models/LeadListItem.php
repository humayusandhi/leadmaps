<?php

declare(strict_types=1);

namespace App\Domain\Lead\Models;

use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeadListItem extends Model
{
    use HasUuids;

    protected $table = 'lead_list_items';

    protected $fillable = [
        'lead_list_id',
        'lead_id',
        'added_by_user_id',
    ];

    public function leadList(): BelongsTo
    {
        return $this->belongsTo(LeadList::class, 'lead_list_id');
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class, 'lead_id');
    }

    public function addedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by_user_id');
    }
}
