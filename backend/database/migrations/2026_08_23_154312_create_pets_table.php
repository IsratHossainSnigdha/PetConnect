<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   
    
     
    public function up(): void
    {
        Schema::create('pets', function (Blueprint $table) {
            $table->id();

            // Pet basic information
            $table->string('name');
            $table->string('type');
            $table->string('breed')->nullable();
            $table->string('age')->nullable();
            $table->string('gender')->nullable();

            
            $table->text('description')->nullable();
            $table->text('image')->nullable();

            // Adoption status 
            $table->string('status')->default('Available'); 

            
            $table->foreignId('shelter_id')
                ->constrained('shelters')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    
     
     
    public function down(): void
    {
        Schema::dropIfExists('pets');
    }
};