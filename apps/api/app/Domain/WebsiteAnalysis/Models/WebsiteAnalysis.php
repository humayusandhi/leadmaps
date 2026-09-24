<?php

declare(strict_types=1);

namespace App\Domain\WebsiteAnalysis\Models;

use App\Domain\Lead\Models\Lead;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebsiteAnalysis extends Model
{
    use HasUuids;

    protected $table = 'website_analyses';

    protected $fillable = [
        'lead_id',
        'status',
        'url',
        'final_url',
        'http_status',
        'load_time_ms',
        'is_ssl_active',
        'has_meta_description',
        'has_open_graph',
        'has_schema_markup',
        'is_mobile_responsive',
        'h1_tags',
        'has_cta',
        'has_contact_form',
        'has_tel_links',
        'has_whatsapp_chat',
        'has_booking_embed',
        'cms_detected',
        'error_message',
        'raw_signals',
        'crawled_at',
    ];

    protected $casts = [
        'http_status' => 'integer',
        'load_time_ms' => 'integer',
        'is_ssl_active' => 'boolean',
        'has_meta_description' => 'boolean',
        'has_open_graph' => 'boolean',
        'has_schema_markup' => 'boolean',
        'is_mobile_responsive' => 'boolean',
        'h1_tags' => 'array',
        'has_cta' => 'boolean',
        'has_contact_form' => 'boolean',
        'has_tel_links' => 'boolean',
        'has_whatsapp_chat' => 'boolean',
        'has_booking_embed' => 'boolean',
        'raw_signals' => 'array',
        'crawled_at' => 'datetime',
    ];

    public function lead(): BelongsTo
    {
        return $this->belongsTo(Lead::class);
    }
}
