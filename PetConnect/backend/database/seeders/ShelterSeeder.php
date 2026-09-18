<?php

namespace Database\Seeders;

use App\Models\Shelter;
use Illuminate\Database\Seeder;

/*
|--------------------------------------------------------------------------
| SEEDER: sample shelter rows
|--------------------------------------------------------------------------
|
| Migrations build the empty TABLES. Seeders put starter DATA in them.
| Keeping the two separate matters: you run migrations on a real production
| server, but you would never seed fake shelters there.
|
| Run it with:
|     php artisan db:seed --class=ShelterSeeder
|
| It is safe to run more than once - see updateOrCreate() below.
|
*/
class ShelterSeeder extends Seeder
{
    public function run(): void
    {
        $shelters = [
            [
                'name'          => 'Paws Rescue',
                'location'      => 'Dhaka, Bangladesh',
                'contact_email' => 'contact@pawsrescue.org',
                'contact_phone' => '01711000001',
                'status'        => 'active',
            ],
            [
                'name'          => 'Happy Tails Shelter',
                'location'      => 'Chattogram, Bangladesh',
                'contact_email' => 'hello@happytails.org',
                'contact_phone' => '01711000002',
                'status'        => 'active',
            ],
            [
                'name'          => 'City Kitty Care',
                'location'      => 'Sylhet, Bangladesh',
                'contact_email' => 'info@citykitty.org',
                'contact_phone' => '01711000003',
                'status'        => 'pending',
            ],
            [
                'name'          => 'Animal Haven',
                'location'      => 'Khulna, Bangladesh',
                'contact_email' => 'support@animalhaven.org',
                'contact_phone' => '01711000004',
                'status'        => 'inactive',
            ],
            [
                'name'          => 'Hope for Paws',
                'location'      => 'Rajshahi, Bangladesh',
                'contact_email' => 'team@hopeforpaws.org',
                'contact_phone' => '01711000005',
                'status'        => 'active',
            ],
        ];

        foreach ($shelters as $shelter) {
            // updateOrCreate() makes the seeder IDEMPOTENT - running it five
            // times produces the same five rows, not twenty-five duplicates.
            //
            // It works in two steps:
            //   1. SELECT * FROM shelters WHERE name = ? LIMIT 1;
            //   2. found?  -> UPDATE that row with the second array
            //      not found -> INSERT a new row from both arrays merged
            //
            // The first argument must be the column(s) that identify the row
            // uniquely - here `name`, which carries a UNIQUE index. Using a
            // non-unique column would let duplicates slip through.
            Shelter::updateOrCreate(
                ['name' => $shelter['name']],
                $shelter
            );
        }

        $this->command->info('Seeded ' . count($shelters) . ' shelters.');
    }
}
