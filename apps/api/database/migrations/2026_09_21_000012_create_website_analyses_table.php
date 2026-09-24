<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('website_analyses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->string('status', 32)->default('pending');
            $table->text('url');
            $table->text('final_url')->nullable();
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->unsignedInteger('load_time_ms')->nullable();
            $table->boolean('is_ssl_active')->default(false);
            $table->boolean('has_meta_description')->default(false);
            $table->boolean('has_open_graph')->default(false);
            $table->boolean('has_schema_markup')->default(false);
            $table->boolean('is_mobile_responsive')->default(false);
            $table->json('h1_tags')->nullable();
            $table->boolean('has_cta')->default(false);
            $table->boolean('has_contact_form')->default(false);
            $table->boolean('has_tel_links')->default(false);
            $table->boolean('has_whatsapp_chat')->default(false);
            $table->boolean('has_booking_embed')->default(false);
            $table->string('cms_detected')->nullable();
            $table->text('error_message')->nullable();
            $table->json('raw_signals')->nullable();
            $table->timestamp('crawled_at')->nullable();
            $table->timestamps();

            $table->index('lead_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('website_analyses');
    }
};
