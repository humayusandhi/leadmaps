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
        Schema::create('ai_outreach_drafts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->foreignUuid('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->string('channel', 32); // 'email', 'whatsapp', 'linkedin'
            $table->string('subject')->nullable();
            $table->text('body');
            $table->string('status', 32)->default('draft');
            $table->unsignedInteger('tokens_used')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['lead_id', 'channel']);
            $table->index('workspace_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_outreach_drafts');
    }
};
