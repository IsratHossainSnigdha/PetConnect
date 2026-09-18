<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Remove the procedure if it already exists
        DB::unprepared(
            'DROP PROCEDURE IF EXISTS create_adoption_application'
        );

        // Read the procedure from the project SQL file
        $procedure = file_get_contents(
            database_path('Procedures/create_adoption_application.sql')
        );

        if ($procedure === false) {
            throw new RuntimeException(
                'Could not read create_adoption_application.sql'
            );
        }

        // Create the procedure
        DB::unprepared($procedure);
    }

    public function down(): void
    {
        DB::unprepared(
            'DROP PROCEDURE IF EXISTS create_adoption_application'
        );
    }
};