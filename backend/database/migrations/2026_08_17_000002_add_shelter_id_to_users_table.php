<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| MIGRATION: link users -> shelters with a FOREIGN KEY
|--------------------------------------------------------------------------
|
| THE RELATIONSHIP WE ARE MODELLING
|
|     shelters                     users
|     --------                     -----
|     id  (PK) <---------------+   id (PK)
|     name                     +-- shelter_id  (FK, nullable)
|     location                     name
|     status                       role
|
| One shelter HAS MANY staff users.  One user BELONGS TO one shelter.
| That is a ONE-TO-MANY relationship, and the rule is always the same:
|
|     >> the foreign key lives on the "many" side <<
|
| So shelter_id goes on `users`, NOT a user_id on `shelters`. If we had put
| user_id on shelters we could only ever store one staff member per shelter.
|
| WHY NULLABLE?
| Adopters and platform admins are also rows in `users`, and they belong to no
| shelter at all. NULL is the correct SQL way to say "this does not apply".
|
*/
return new class extends Migration
{
    public function up(): void
    {
        // ---------------------------------------------------------------
        // STEP 1: add the foreign key column
        // ---------------------------------------------------------------
        Schema::table('users', function (Blueprint $table) {
            // foreignId() creates: `shelter_id` BIGINT UNSIGNED NULL
            //
            // The type must EXACTLY match the type of shelters.id (which is
            // BIGINT UNSIGNED, created by $table->id()). MySQL refuses to build
            // a foreign key between mismatched types - a very common beginner
            // error ("errno 150: foreign key constraint is incorrectly formed").
            $table->foreignId('shelter_id')
                  ->nullable()
                  ->after('role')          // cosmetic: column position in the table
                  ->constrained('shelters') // adds: FOREIGN KEY (shelter_id) REFERENCES shelters(id)
                  ->nullOnDelete();         // adds: ON DELETE SET NULL
            //
            // WHAT nullOnDelete() ACTUALLY BUYS YOU (referential integrity):
            // Once this constraint exists, MySQL guarantees that shelter_id either
            // is NULL or points at a shelter row that really exists. You physically
            // cannot create an "orphan" pointing at shelter 999.
            //
            // ON DELETE SET NULL decides what happens when a shelter is deleted:
            //   nullOnDelete()    -> staff rows survive, their shelter_id becomes NULL
            //   cascadeOnDelete() -> staff accounts get DELETED along with the shelter
            //   restrictOnDelete()-> the delete is BLOCKED while staff still reference it
            //
            // We chose SET NULL deliberately: removing a shelter from the platform
            // should not silently destroy people's login accounts.
        });

        // ---------------------------------------------------------------
        // STEP 2: backfill - move existing data into the new structure
        // ---------------------------------------------------------------
        // A migration is not only about SHAPE, it is also about the DATA already
        // sitting in the table. Any shelter staff who signed up before today have
        // their shelter details stranded in users.shelter_name. We copy each one
        // into the new shelters table and connect it back up.
        //
        // NOTE: we use the DB query builder here, not the Eloquent User model.
        // Migrations must keep working years from now, and models change over
        // time. Raw queries are frozen in time, so the migration stays correct.

        $legacyStaff = DB::table('users')
            ->where('role', 'shelter_staff')      // SQL: WHERE role = 'shelter_staff'
            ->whereNotNull('shelter_name')        // SQL: AND shelter_name IS NOT NULL
            ->get();

        foreach ($legacyStaff as $staff) {
            // insertGetId() runs an INSERT and returns the new AUTO_INCREMENT id,
            // which is exactly the value we need for the foreign key.
            $shelterId = DB::table('shelters')->insertGetId([
                'name'          => $staff->shelter_name,
                'location'      => $staff->address ?? 'Not specified',
                'contact_email' => $staff->email,   // reuse the staff email; it is already UNIQUE
                'contact_phone' => $staff->shelter_contact ?? $staff->phone ?? 'Not specified',
                'status'        => 'active',        // they were already using the system
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            // SQL: UPDATE users SET shelter_id = ? WHERE id = ?
            DB::table('users')
                ->where('id', $staff->id)
                ->update(['shelter_id' => $shelterId]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ORDER MATTERS when reversing.
            // You must drop the CONSTRAINT before you can drop the COLUMN,
            // because MySQL will not let you delete a column that a live foreign
            // key depends on.
            $table->dropForeign(['shelter_id']);
            $table->dropColumn('shelter_id');
        });
    }
};
