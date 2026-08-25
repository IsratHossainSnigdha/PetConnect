<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoPetSeeder extends Seeder
{
    public function run(): void
    {
        $happyPaws = DB::table('shelters')
            ->where('name', 'Happy Paws Shelter')
            ->first();

        $safeHaven = DB::table('shelters')
            ->where('name', 'Safe Haven Animal Shelter')
            ->first();

        $hopeAnimal = DB::table('shelters')
            ->where('name', 'Hope Animal Center')
            ->first();

        if (!$happyPaws || !$safeHaven || !$hopeAnimal) {
            $this->command->error(
                'Demo shelters were not found. Run DemoShelterSeeder first.'
            );

            return;
        }

        DB::table('pets')->insert([
            [
                'name' => 'Max',
                'type' => 'Dog',
                'breed' => 'Golden Retriever',
                'age' => 3,
                'gender' => 'Male',
                'description' =>
                    'Friendly and energetic Golden Retriever looking for a loving home.',
                'image' => null,
                'status' => 'available',
                'shelter_id' => $happyPaws->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Luna',
                'type' => 'Cat',
                'breed' => 'Persian',
                'age' => 2,
                'gender' => 'Female',
                'description' =>
                    'Calm and affectionate Persian cat who enjoys attention.',
                'image' => null,
                'status' => 'available',
                'shelter_id' => $safeHaven->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Rocky',
                'type' => 'Dog',
                'breed' => 'German Shepherd',
                'age' => 4,
                'gender' => 'Male',
                'description' =>
                    'Loyal and intelligent German Shepherd looking for an experienced adopter.',
                'image' => null,
                'status' => 'available',
                'shelter_id' => $hopeAnimal->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Bella',
                'type' => 'Dog',
                'breed' => 'Labrador Retriever',
                'age' => 2,
                'gender' => 'Female',
                'description' =>
                    'Playful Labrador who loves people and outdoor activities.',
                'image' => null,
                'status' => 'available',
                'shelter_id' => $happyPaws->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Milo',
                'type' => 'Cat',
                'breed' => 'Domestic Shorthair',
                'age' => 1,
                'gender' => 'Male',
                'description' =>
                    'Playful young cat who would make a wonderful companion.',
                'image' => null,
                'status' => 'available',
                'shelter_id' => $safeHaven->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Coco',
                'type' => 'Dog',
                'breed' => 'Beagle',
                'age' => 3,
                'gender' => 'Female',
                'description' =>
                    'Sweet and curious Beagle looking for a caring family.',
                'image' => null,
                'status' => 'available',
                'shelter_id' => $hopeAnimal->id,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $this->command->info(
            'Demo pets created successfully.'
        );
    }
}