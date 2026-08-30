<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|==============================================================================
| Give every shelter an assigned admin   (issue #17)
|==============================================================================
|
| WHAT WE ARE ADDING
|
| Each shelter should have one platform admin responsible for it, so the
| Shelter Management table can show who to contact about each shelter.
|
|     shelters                        users
|     --------                        -----
|     id                              id  (PK)
|     name                            name
|     location          admin_id  ->  email
|     admin_id  --------------------> (a platform_admin)
|
|------------------------------------------------------------------------------
| THIS IS A SECOND, SEPARATE LINK BETWEEN THE SAME TWO TABLES
|------------------------------------------------------------------------------
|
| We already had one:
|
|     users.shelter_id  -> shelters.id     "which shelter do I WORK AT?"
|
| and now we add the opposite direction:
|
|     shelters.admin_id -> users.id        "who MANAGES this shelter?"
|
| They answer different questions, so they are different columns. Two tables
| are allowed to reference each other as many times as the design needs -
| what matters is that each foreign key has one clear meaning.
|
|     shelter staff  = many people per shelter  -> key lives on users
|     assigned admin = one person per shelter   -> key lives on shelters
|
| The rule never changes: the foreign key goes on the "many" side.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shelters', function (Blueprint $table) {

            /*
            | nullable() because a shelter may not have an admin assigned yet -
            | and because every shelter already in the table has no admin at
            | the moment this migration runs. A NOT NULL column with no default
            | would make the ALTER TABLE fail on those existing rows.
            |
            | In SQL, NULL means "not known / not applicable", which is exactly
            | what an unassigned shelter is.
            */
            $table->foreignId('admin_id')
                  ->nullable()
                  ->after('status')
                  ->constrained('users')   // FOREIGN KEY (admin_id) REFERENCES users(id)
                  ->nullOnDelete();        // ON DELETE SET NULL

            /*
            | WHY nullOnDelete() AND NOT cascadeOnDelete()
            |
            | cascadeOnDelete would mean: delete the admin account, and every
            | shelter they managed is deleted too. That would destroy real
            | shelter records because of a staffing change - clearly wrong.
            |
            | nullOnDelete means the shelter survives and simply has no admin
            | assigned again, which is the honest answer.
            */

            // We will often ask "which shelters does this admin manage?", so
            // an index on the column makes that lookup fast.
            $table->index('admin_id');
        });
    }

    public function down(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            // Order matters: drop the constraint before the column, because
            // MySQL will not delete a column a live foreign key depends on.
            $table->dropForeign(['admin_id']);
            $table->dropIndex(['admin_id']);
            $table->dropColumn('admin_id');
        });
    }
};
