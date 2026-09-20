<?php

declare(strict_types=1);

namespace App\Domain\Workspace\Models;

use App\Domain\Auth\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workspace extends Model
{
    use HasUuids;

    protected $table = 'workspaces';

    protected $fillable = [
        'name',
        'slug',
        'tier',
        'credit_balance',
    ];

    protected $casts = [
        'credit_balance' => 'integer',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(WorkspaceMember::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_members')
            ->withPivot(['id', 'role'])
            ->withTimestamps();
    }
}
