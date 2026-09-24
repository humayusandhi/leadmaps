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
        Schema::create('credit_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('workspace_id')->constrained('workspaces')->cascadeOnDelete();
            $table->integer('amount'); // Positive for grant/refund, negative for consumption
            $table->string('type', 32); // MONTHLY_GRANT, PURCHASE, CONSUMPTION, REFUND, ADJUSTMENT
            $table->string('description');
            $table->string('reference_id')->nullable();
            $table->unsignedInteger('balance_after');
            $table->timestamps();

            $table->index(['workspace_id', 'created_at']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credit_transactions');
    }
};
