<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| MIGRATION: create the "shelters" table
|--------------------------------------------------------------------------
|
| A migration is version control for your DATABASE SCHEMA. Instead of opening
| phpMyAdmin and clicking "New Table", you describe the table in PHP. Anyone
| who clones this repo runs `php artisan migrate` and gets the identical
| schema. That is why migrations are committed to git but the data is not.
|
| WHY A SEPARATE TABLE AT ALL?
| Before this migration a "shelter" was just two extra columns on the users
| table (shelter_name, shelter_contact). That design breaks the rules of
| normalisation:
|
|   - A shelter could not exist until somebody signed up for it.
|   - Two staff members at "Paws Rescue" would each store the string
|     "Paws Rescue" -> duplicated data -> if you rename the shelter you must
|     remember to update every row (this is called an UPDATE ANOMALY).
|   - Deleting the last staff account would delete the shelter's details
|     with it (a DELETE ANOMALY).
|
| Giving shelters their own table means each real-world shelter is stored
| exactly ONCE, and users point at it with a foreign key. That is Second
| Normal Form: every non-key column depends on the whole key of its own
| table.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shelters', function (Blueprint $table) {
            // PRIMARY KEY
            // id() creates: `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY
            // This is a "surrogate key" - a meaningless number whose only job is
            // to uniquely identify the row. We prefer it over using the shelter
            // NAME as the key, because names change and keys should never change.
            $table->id();

            // `name` VARCHAR(255) NOT NULL UNIQUE
            // unique() adds a UNIQUE INDEX. The DATABASE now refuses to store two
            // shelters with the same name. This is a real constraint enforced by
            // MySQL itself - even if somebody bypasses our PHP code and inserts
            // directly with raw SQL, the duplicate is rejected.
            // Validating only in PHP is not enough; the database is the last line
            // of defence for data integrity.
            $table->string('name')->unique();

            // `location` VARCHAR(255) NOT NULL
            // Where the shelter physically is, e.g. "Dhaka, Bangladesh".
            $table->string('location');

            // `contact_email` VARCHAR(255) NOT NULL UNIQUE
            $table->string('contact_email')->unique();

            // `contact_phone` VARCHAR(255) NOT NULL
            // Stored as a STRING, not an integer! Phone numbers can start with a
            // leading zero ("01712345678") and may contain "+". An INT would throw
            // the leading zero away. Rule of thumb: if you never do arithmetic on
            // it, it is text, not a number.
            $table->string('contact_phone');

            // `status` ENUM('active','pending','inactive') NOT NULL DEFAULT 'pending'
            // An ENUM restricts the column to a fixed list of values at the DATABASE
            // level. Trying to save 'banana' raises an SQL error. New shelters start
            // as 'pending' so an admin has to approve them before they go live.
            $table->enum('status', ['active', 'pending', 'inactive'])
                  ->default('pending');

            // timestamps() creates two columns: `created_at` and `updated_at`
            // (both TIMESTAMP NULL). Laravel fills them in automatically on every
            // insert and update, which gives you a free audit trail - useful for
            // the "newest shelters first" ordering in the admin dashboard.
            $table->timestamps();

            // A PLAIN (non-unique) INDEX on status.
            // The admin dashboard runs queries like:
            //     SELECT * FROM shelters WHERE status = 'active';
            // Without an index MySQL performs a FULL TABLE SCAN: it reads every
            // single row to find the matching ones. With an index it jumps
            // straight to them, the same way you use the index at the back of a
            // textbook instead of reading all the pages.
            // Index the columns you FILTER or SORT by - not every column, because
            // each index makes INSERT/UPDATE slightly slower and uses disk space.
            $table->index('status');
        });
    }

    /**
     * down() is the UNDO of up(). Running `php artisan migrate:rollback`
     * calls this. Always write it, so a bad migration can be reversed
     * instead of forcing you to rebuild the whole database.
     */
    public function down(): void
    {
        Schema::dropIfExists('shelters');
    }
};
