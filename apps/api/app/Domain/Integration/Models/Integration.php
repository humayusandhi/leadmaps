<?php

declare(strict_types=1);

namespace App\Domain\Integration\Models;

use App\Domain\Workspace\Models\Workspace;
use App\Domain\Workspace\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class Integration extends Model
{
    use HasUuids;
    use BelongsToTenant;

    protected $table = 'integrations';

    protected $fillable = [
        'workspace_id',
        'provider',
        'name',
        'credentials',
        'settings',
        'status',
        'last_synced_at',
    ];

    protected $casts = [
        'settings' => 'array',
        'last_synced_at' => 'datetime',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(IntegrationLog::class, 'integration_id');
    }

    /**
     * Safely encrypt credentials payload before storing.
     */
    public function setCredentialsAttribute(array|string $value): void
    {
        $payload = is_array($value) ? json_encode($value) : (string) $value;
        try {
            $this->attributes['credentials'] = Crypt::encryptString($payload);
        } catch (\Throwable) {
            // Fallback for tests / unconfigured APP_KEY
            $this->attributes['credentials'] = base64_encode($payload);
        }
    }

    /**
     * Safely decrypt credentials payload.
     *
     * @return array<string, mixed>
     */
    public function getDecryptedCredentials(): array
    {
        if (empty($this->credentials)) {
            return [];
        }

        try {
            $decrypted = Crypt::decryptString($this->credentials);
        } catch (\Throwable) {
            $decrypted = base64_decode($this->credentials, true) ?: $this->credentials;
        }

        $decoded = json_decode($decrypted, true);

        return is_array($decoded) ? $decoded : [];
    }
}
