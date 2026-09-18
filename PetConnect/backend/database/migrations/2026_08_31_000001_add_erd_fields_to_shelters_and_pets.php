<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|==============================================================================
| Bring shelters and pets in line with the ER diagram
|==============================================================================
|
| The ER diagram lists three attributes that were never built:
|
|     shelter.description       what the shelter is about
|     pets.health_status        the animal's general condition
|     pets.vaccine_status       whether its vaccinations are up to date
|
| The shelter page needs all three: a shelter has a description to show, and
| its list of animals should say whether each one is healthy and vaccinated.
|
| WHY ALTER RATHER THAN REBUILD
| These tables already hold real rows. A migration that adds a column keeps
| the data; dropping and recreating the table would throw it away. Adding a
| column is one of the few schema changes that is safe on a live table.
|
| Every column here is NULLABLE, and that is not laziness. The rows that
| already exist have no value for them, and a NOT NULL column with no default
| would make the ALTER TABLE fail outright. NULL is the honest SQL answer for
| "nobody has filled this in yet".
|
*/
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            // text, not string: a description is a paragraph, and VARCHAR(255)
            // would cut it off mid-sentence.
            $table->text('description')->nullable()->after('location');
        });

        Schema::table('pets', function (Blueprint $table) {
            /*
            | An ENUM restricts the column to a fixed list at the DATABASE
            | level, so 'banana' is rejected by MySQL itself rather than only
            | by our PHP. That is what makes the health filter on the shelter
            | page trustworthy - the values cannot drift.
            */
            $table->enum('health_status', ['healthy', 'treatment', 'critical'])
                  ->nullable()
                  ->after('gender');

            $table->enum('vaccine_status', ['vaccinated', 'partial', 'not_vaccinated'])
                  ->nullable()
                  ->after('health_status');
        });
    }

    public function down(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            $table->dropColumn('description');
        });

        Schema::table('pets', function (Blueprint $table) {
            $table->dropColumn(['health_status', 'vaccine_status']);
        });
    }
};
