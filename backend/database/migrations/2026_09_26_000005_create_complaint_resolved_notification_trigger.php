<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| NOTIFY THE USER WHEN THEIR COMPLAINT IS RESOLVED       (issue #63)
|==============================================================================
|
| A TRIGGER is a block of SQL that MySQL runs by itself whenever a particular
| change happens to a table. Nobody calls it. It is attached to the table, so
| it fires no matter what caused the UPDATE - the admin page, a stored
| procedure, or someone typing SQL by hand.
|
| That is exactly what this issue asks for: the notification must not depend on
| the backend remembering to insert one.
|
|     AFTER UPDATE ON complaints  ->  runs once per updated row, after the row
|                                     has already changed
|
| AFTER rather than BEFORE, because we only want to notify about a change that
| actually succeeded. A BEFORE trigger runs while the UPDATE could still fail.
|
| The SQL lives in database/triggers/ so it can be read on its own.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        // Drop first so re-running this migration, or editing the .sql file and
        // migrating again, both work. MySQL refuses to create a trigger whose
        // name already exists.
        DB::unprepared(
            'DROP TRIGGER IF EXISTS trg_notify_user_on_complaint_resolved'
        );

        $trigger = file_get_contents(
            database_path('triggers/create_trg_notify_user_on_complaint_resolved.sql')
        );

        if ($trigger === false) {
            throw new RuntimeException(
                'Could not read create_trg_notify_user_on_complaint_resolved.sql'
            );
        }

        // No DELIMITER line in that file on purpose. DELIMITER is a command the
        // `mysql` terminal client understands, not real SQL - it only exists so
        // the client knows the semicolons inside BEGIN ... END are not the end
        // of the statement. DB::unprepared already sends the whole thing as one
        // statement, so a DELIMITER line would be a syntax error here.
        DB::unprepared($trigger);
    }

    public function down(): void
    {
        DB::unprepared(
            'DROP TRIGGER IF EXISTS trg_notify_user_on_complaint_resolved'
        );
    }
};
