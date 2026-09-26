<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/*
|==============================================================================
| DUMMY ACCOUNT SEEDER
|==============================================================================
|
| Creates one test login for each of the three roles in the users table:
|
|     role ENUM('adopter', 'shelter_staff', 'platform_admin')
|
| Run it with:
|
|     php artisan db:seed --class=DummyAccountSeeder
|
| Every account gets the SAME password so there is only one thing to remember
| while testing. See the $password below.
|
| WHY THIS UPDATES INSTEAD OF DELETING
|   The obvious way to make a seeder repeatable is DELETE then INSERT. That is
|   wrong here. complaints.user_id and applications.adopter_id are foreign keys
|   with ON DELETE CASCADE, so deleting a user silently deletes every complaint
|   and adoption application they ever made - the dummy adopter already owns 3
|   applications that other test data depends on.
|
|   So this checks whether the email already exists and UPDATEs if it does.
|   That keeps the same id, which keeps all the child rows attached.
|
*/
class DummyAccountSeeder extends Seeder
{
    public function run(): void
    {
        // One password for all three accounts, to keep testing simple.
        $password = 'dummy1234';

        /*
        | Hash::make() runs bcrypt. The users.password column stores the HASH,
        | never the password itself, so nobody reading the database can see
        | what you typed. Logging in later re-hashes what you type and compares
        | the two hashes with Hash::check().
        |
        | Hashed once here, outside the loop, because bcrypt is deliberately
        | slow - that slowness is the point of it.
        */
        $hash = Hash::make($password);

        // A real shelter for the staff account to belong to. Shelter staff are
        // scoped to one shelter: the shelter dashboard filters everything by
        // this id, so a staff member with shelter_id = NULL sees nothing.
        $shelter = DB::selectOne(
            "SELECT id, name FROM shelters ORDER BY id LIMIT 1"
        );

        $accounts = [
            [
                'name'       => 'Dummy Admin',
                'email'      => 'dummy.admin@demo.test',
                'role'       => 'platform_admin',
                'phone'      => '01700000001',
                'address'    => 'Head Office, Dhaka',
                // Admins are platform-wide, not tied to one shelter.
                'shelter_id' => null,
            ],
            [
                'name'       => 'Dummy Staff',
                'email'      => 'dummy.staff@demo.test',
                'role'       => 'shelter_staff',
                'phone'      => '01700000002',
                'address'    => 'Dhaka',
                'shelter_id' => $shelter->id ?? null,
            ],
            [
                'name'       => 'Dummy Adopter',
                'email'      => 'dummy.adopter@demo.test',
                'role'       => 'adopter',
                'phone'      => '01700000003',
                'address'    => 'Mirpur, Dhaka',
                'shelter_id' => null,
            ],
        ];

        foreach ($accounts as $account) {
            // Does this email already exist? The email column is UNIQUE, so an
            // INSERT would fail with a duplicate key error rather than quietly
            // making a second copy.
            $existing = DB::selectOne(
                "SELECT id FROM users WHERE email = ?",
                [$account['email']]
            );

            if ($existing) {
                DB::update(
                    "UPDATE users
                     SET name       = ?,
                         password   = ?,
                         role       = ?,
                         phone      = ?,
                         address    = ?,
                         shelter_id = ?,
                         updated_at = NOW()
                     WHERE id = ?",
                    [
                        $account['name'],
                        $hash,
                        $account['role'],
                        $account['phone'],
                        $account['address'],
                        $account['shelter_id'],
                        $existing->id,
                    ]
                );

                $this->command->info(
                    "updated  #{$existing->id}  {$account['email']}  ({$account['role']})"
                );
            } else {
                DB::insert(
                    "INSERT INTO users
                        (name, email, password, role, phone, address, shelter_id,
                         email_verified_at, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())",
                    [
                        $account['name'],
                        $account['email'],
                        $hash,
                        $account['role'],
                        $account['phone'],
                        $account['address'],
                        $account['shelter_id'],
                    ]
                );

                // AUTO_INCREMENT picked the id, so ask MySQL what it chose.
                $newId = DB::getPdo()->lastInsertId();

                $this->command->info(
                    "created  #{$newId}  {$account['email']}  ({$account['role']})"
                );
            }
        }

        $this->command->newLine();
        $this->command->info("All three accounts use the password: {$password}");

        if ($shelter) {
            $this->command->info(
                "Dummy Staff is attached to shelter #{$shelter->id} ({$shelter->name})"
            );
        } else {
            $this->command->warn(
                'No shelters exist, so Dummy Staff has shelter_id = NULL and the '
                . 'shelter dashboard will look empty. Seed a shelter first.'
            );
        }
    }
}
