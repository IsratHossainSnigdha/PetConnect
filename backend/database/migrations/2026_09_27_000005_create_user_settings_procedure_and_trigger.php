<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| INSTALL THE SETTINGS PROCEDURE AND TRIGGER
|==============================================================================
|
| Two database objects, installed together because they work as a pair:
|
|   sp_save_user_settings          validates, then INSERTs or UPDATEs inside a
|                                  transaction
|   trg_log_user_settings_change   fires on that UPDATE and records what
|                                  actually changed
|
| Neither is called by the other. The procedure runs an UPDATE; MySQL notices
| the table has a trigger and runs it. That is why the history is written even
| though no PHP and no SQL in the procedure mentions user_settings_history.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_save_user_settings');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_log_user_settings_change');

        $procedure = file_get_contents(
            database_path('procedures/sp_save_user_settings.sql')
        );
        $trigger = file_get_contents(
            database_path('triggers/create_trg_log_user_settings_change.sql')
        );

        if ($procedure === false || $trigger === false) {
            throw new RuntimeException('Could not read the settings SQL files.');
        }

        // No DELIMITER lines in either file. DELIMITER is a command the `mysql`
        // terminal client understands, not real SQL - DB::unprepared already
        // sends each file as one statement.
        DB::unprepared($procedure);
        DB::unprepared($trigger);
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS trg_log_user_settings_change');
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_save_user_settings');
    }
};
