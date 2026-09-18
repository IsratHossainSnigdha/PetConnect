<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| MIGRATION: add a username column to users
|--------------------------------------------------------------------------
|
| The admin profile screen has a "Username" field, but there was no column
| behind it - the value was hard-coded in React. A field with no column can
| never be saved, so we add the column first.
|
| WHY nullable() AND unique() TOGETHER?
| At the moment this migration runs, existing users already have rows with no
| username. A NOT NULL column with no default would make the ALTER TABLE fail
| outright. So the column must accept NULL.
|
| The useful part: in SQL, NULL is "unknown", and two unknowns are never
| considered equal. That means a UNIQUE index allows ANY NUMBER of NULL rows
| while still rejecting two rows that share the same actual username. That is
| exactly the behaviour we want for an optional-but-unique field.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable()->unique()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // A UNIQUE constraint is implemented as an INDEX, and MySQL will not
            // drop a column while an index still points at it - so drop the
            // index first, then the column.
            $table->dropUnique('users_username_unique');
            $table->dropColumn('username');
        });
    }
};
