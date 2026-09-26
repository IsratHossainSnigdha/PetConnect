<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| INSTALL sp_escalate_old_complaints
|==============================================================================
|
| A stored procedure lives inside MySQL, not inside the PHP code, so it has to
| be installed. Putting it in a migration means a teammate who clones the repo
| and runs `php artisan migrate` gets the procedure automatically, instead of
| having to remember to import a .sql file by hand.
|
| Same pattern as 2026_09_18_132516_create_adoption_application_procedure.php:
| the SQL lives in its own readable .sql file and the migration just loads it.
|
| Note there is no DELIMITER line in that .sql file. DELIMITER is a command the
| `mysql` terminal client understands, not real SQL - it exists only so the
| client knows the semicolons inside BEGIN ... END are not the end of the
| statement. DB::unprepared sends the whole file as one statement already, so
| adding DELIMITER here would be a syntax error.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        // Drop first so running this migration twice, or editing the .sql file
        // and re-running it, both work. MySQL refuses CREATE PROCEDURE if one
        // of that name already exists.
        DB::unprepared(
            'DROP PROCEDURE IF EXISTS sp_escalate_old_complaints'
        );

        $procedure = file_get_contents(
            database_path('procedures/sp_escalate_old_complaints.sql')
        );

        if ($procedure === false) {
            throw new RuntimeException(
                'Could not read sp_escalate_old_complaints.sql'
            );
        }

        DB::unprepared($procedure);
    }

    public function down(): void
    {
        DB::unprepared(
            'DROP PROCEDURE IF EXISTS sp_escalate_old_complaints'
        );
    }
};
