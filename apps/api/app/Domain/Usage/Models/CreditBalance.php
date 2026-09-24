<?php

declare(strict_types=1);

namespace App\Domain\Usage\Models;

use App\Domain\Workspace\Models\Workspace;
use App\Domain\Workspace\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditBalance extends Model
{
    use HasUuids;
    use BelongsToTenant;

    protected $table = 'credit_balances';

    protected $fillable = [
        'workspace_id',
        'balance',
        'reserved',
        'lifetime_granted',
        'lifetime_consumed',
    ];

    protected $casts = [
        'balance' => 'integer',
        'reserved' => 'integer',
        'lifetime_granted' => 'integer',
        'lifetime_consumed' => 'integer',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Compute available unreserved credits.
     */
    public function getAvailableCreditsAttribute(): int
    {
        return max(0, $this->balance - $this->reserved);
    }
}
