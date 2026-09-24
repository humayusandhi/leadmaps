<?php

declare(strict_types=1);

namespace App\Domain\Export\Models;

use App\Domain\Auth\Models\User;
use App\Domain\Workspace\Models\Workspace;
use App\Domain\Workspace\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExportJob extends Model
{
    use HasUuids;
    use BelongsToTenant;

    protected $table = 'export_jobs';

    protected $fillable = [
        'workspace_id',
        'user_id',
        'status',
        'type',
        'file_path',
        'file_name',
        'row_count',
        'filters',
        'columns',
        'expires_at',
    ];

    protected $casts = [
        'row_count' => 'integer',
        'filters' => 'array',
        'columns' => 'array',
        'expires_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
