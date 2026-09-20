<?php

declare(strict_types=1);

namespace App\Domain\Workspace\Traits;

use App\Domain\Workspace\Models\Workspace;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    /**
     * Boot the trait and apply the global tenant isolation scope.
     */
    protected static function bootBelongsToTenant(): void
    {
        static::addGlobalScope('tenant_isolation', function (Builder $builder) {
            if (app()->bound('current_workspace_id')) {
                $workspaceId = app('current_workspace_id');
                if ($workspaceId) {
                    $builder->where($builder->getModel()->getTable() . '.workspace_id', $workspaceId);
                }
            }
        });

        static::creating(function (Model $model) {
            if (app()->bound('current_workspace_id') && empty($model->workspace_id)) {
                $model->workspace_id = app('current_workspace_id');
            }
        });
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
