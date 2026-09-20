<?php

declare(strict_types=1);

namespace App\Domain\Workspace\Models;

use App\Domain\Auth\Models\User;
use App\Domain\Workspace\Enums\WorkspaceRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkspaceMember extends Model
{
    use HasUuids;

    protected $table = 'workspace_members';

    protected $fillable = [
        'workspace_id',
        'user_id',
        'role',
    ];

    protected $casts = [
        'role' => WorkspaceRole::class,
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
