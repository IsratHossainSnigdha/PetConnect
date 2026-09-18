<?php

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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();

            // Adopter who submitted the application
            $table->foreignId('adopter_id')
                ->constrained('users')
                ->cascadeOnDelete();

            // Pet being applied for
            $table->foreignId('pet_id')
                ->constrained('pets')
                ->cascadeOnDelete();

            // Application status
            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
            ])->default('pending');

            $table->timestamps();

            // Prevent the same adopter from applying
            // for the same pet multiple times.
            $table->unique([
                'adopter_id',
                'pet_id',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};