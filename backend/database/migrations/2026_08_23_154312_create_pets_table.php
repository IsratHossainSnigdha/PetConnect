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
        Schema::create('pets', function (Blueprint $table) {
            $table->id();

            // Pet basic information
            $table->string('name');
            $table->string('type'); // Dog, Cat, etc.
            $table->string('breed')->nullable();
            $table->unsignedInteger('age')->nullable();
            $table->string('gender')->nullable();

            // Pet description and image
            $table->text('description')->nullable();
            $table->string('image')->nullable();

            // Adoption status
            $table->enum('status', [
                'available',
                'pending',
                'adopted',
            ])->default('available');

            // Shelter that currently owns/manages the pet
            $table->foreignId('shelter_id')
                ->constrained('shelters')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pets');
    }
};