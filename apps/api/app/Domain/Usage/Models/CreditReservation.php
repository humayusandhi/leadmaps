<?php

declare(strict_types=1);

namespace App\Domain\Usage\Models;

use App\Domain\Workspace\Models\Workspace;
use App\Domain\Workspace\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CreditReservation extends Model
{
    use HasUuids;
    use BelongsToTenant;

    protected $table = 'credit_reservations';

    protected $fillable = [
        'workspace_id',
        'job_id',
        'amount',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'expires_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
