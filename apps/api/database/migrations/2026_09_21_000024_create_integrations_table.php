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
        Schema::create('integrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->string('provider', 32); // riffcrm, hubspot, salesforce, webhook
            $table->string('name');
            $table->text('credentials'); // Encrypted JSON payload (api_key, base_url, etc.)
            $table->json('settings')->nullable(); // Field mappings, auto-sync flags
            $table->string('status', 32)->default('DISCONNECTED'); // DISCONNECTED, CONNECTED, ERROR
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->unique(['workspace_id', 'provider']);
            $table->index('workspace_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('integrations');
    }
};
