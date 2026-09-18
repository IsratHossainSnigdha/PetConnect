<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemoShelterSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('shelters')->insert([
            [
                'name' => 'Happy Paws Shelter',
                'location' => 'Dhaka',
                'contact_email' => 'happypaws@example.com',
                'contact_phone' => '01711111111',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Safe Haven Animal Shelter',
                'location' => 'Uttara, Dhaka',
                'contact_email' => 'safehaven@example.com',
                'contact_phone' => '01722222222',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            [
                'name' => 'Hope Animal Center',
                'location' => 'Mirpur, Dhaka',
                'contact_email' => 'hopeanimal@example.com',
                'contact_phone' => '01733333333',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}