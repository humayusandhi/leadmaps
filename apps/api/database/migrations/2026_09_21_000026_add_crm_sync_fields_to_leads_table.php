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
        Schema::table('leads', function (Blueprint $table) {
            $table->string('crm_sync_status', 32)->default('NOT_SYNCED'); // NOT_SYNCED, SYNCING, SYNCED, FAILED
            $table->string('crm_external_id')->nullable();
            $table->timestamp('crm_synced_at')->nullable();

            $table->index('crm_sync_status');
            $table->index('crm_external_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn(['crm_sync_status', 'crm_external_id', 'crm_synced_at']);
        });
    }
};
