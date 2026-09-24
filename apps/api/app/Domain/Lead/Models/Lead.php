<?php

declare(strict_types=1);

namespace App\Domain\Lead\Models;

use App\Domain\Auth\Models\User;
use App\Domain\Business\Models\Business;
use App\Domain\Lead\Enums\LeadStatusEnum;
use App\Domain\Workspace\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Lead extends Model
{
    use HasUuids;
    use BelongsToTenant;

    protected $table = 'leads';

    protected $fillable = [
        'workspace_id',
        'business_id',
        'status',
        'lead_score',
        'score_breakdown',
        'assigned_to_user_id',
        'crm_sync_status',
        'crm_external_id',
        'crm_synced_at',
        'archived_at',
    ];

    protected $casts = [
        'status' => LeadStatusEnum::class,
        'lead_score' => 'integer',
        'score_breakdown' => 'array',
        'crm_synced_at' => 'datetime',
        'archived_at' => 'datetime',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(LeadScore::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(LeadNote::class)->orderBy('created_at', 'desc');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'lead_tags')
            ->withTimestamps();
    }

    public function websiteAnalysis(): HasOne
    {
        return $this->hasOne(\App\Domain\WebsiteAnalysis\Models\WebsiteAnalysis::class)->latestOfMany();
    }

    public function aiOpportunities(): HasMany
    {
        return $this->hasMany(\App\Domain\AI\Models\AiOpportunity::class);
    }

    public function latestAiAnalysis(): HasOne
    {
        return $this->hasOne(\App\Domain\AI\Models\AiAnalysis::class)->latestOfMany();
    }

    public function leadLists(): BelongsToMany
    {
        return $this->belongsToMany(LeadList::class, 'lead_list_items', 'lead_id', 'lead_list_id')
            ->withTimestamps();
    }

    public function outreachDrafts(): HasMany
    {
        return $this->hasMany(\App\Domain\AI\Models\AiOutreachDraft::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }

    public function scopeArchived(Builder $query): Builder
    {
        return $query->whereNotNull('archived_at');
    }

    public function scopeWithStatus(Builder $query, LeadStatusEnum|string $status): Builder
    {
        $statusVal = $status instanceof LeadStatusEnum ? $status->value : $status;
        return $query->where('status', $statusVal);
    }

    public function scopeWithMinScore(Builder $query, int $minScore): Builder
    {
        return $query->where('lead_score', '>=', $minScore);
    }
}
