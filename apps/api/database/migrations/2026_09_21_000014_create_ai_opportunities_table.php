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
        Schema::create('ai_opportunities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ai_analysis_id')->constrained('ai_analyses')->cascadeOnDelete();
            $table->foreignUuid('lead_id')->constrained('leads')->cascadeOnDelete();
            $table->string('category', 64);
            $table->string('title');
            $table->text('evidence');
            $table->string('suggested_service');
            $table->string('confidence', 16)->default('MEDIUM');
            $table->unsignedSmallInteger('points_estimated')->default(0);
            $table->timestamps();

            $table->index('lead_id');
            $table->index(['lead_id', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_opportunities');
    }
};
