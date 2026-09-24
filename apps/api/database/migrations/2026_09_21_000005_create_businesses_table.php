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
        Schema::create('businesses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('google_place_id')->unique();
            $table->string('name');
            $table->text('formatted_address');
            $table->string('city')->nullable();
            $table->string('country')->default('USA');
            $table->string('phone_number')->nullable();
            $table->string('website_url', 1024)->nullable();
            $table->decimal('rating', 2, 1)->nullable();
            $table->unsignedInteger('review_count')->default(0);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->json('raw_provider_payload')->nullable();
            $table->timestamps();

            $table->index('google_place_id');
            $table->index(['latitude', 'longitude']);
            $table->index('city');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
