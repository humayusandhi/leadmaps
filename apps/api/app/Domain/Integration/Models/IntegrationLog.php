<?php

declare(strict_types=1);

namespace App\Domain\Integration\Models;

use App\Domain\Lead\Models\Lead;
use App\Domain\Workspace\Models\Workspace;
use App\Domain\Workspace\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntegrationLog extends Model
{
    use HasUuids;
    use BelongsToTenant;

    protected $table = 'integration_logs';

    protected $fillable = [
        'workspace_id',
        'integration_id',
        'lead_id',
        'event',
        'status',
        'external_id',
        'request_payload',
        'response_payload',
        'error_message',
    ];

    protected $casts = [
        'request_payload' => 'array',
        'response_payload' => 'array',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function integration(): BelongsTo
    {
        return $this->belongsTo(Integration::class);
    }

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
