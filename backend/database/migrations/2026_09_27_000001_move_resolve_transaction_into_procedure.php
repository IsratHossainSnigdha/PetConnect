<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| MOVE THE RESOLVE TRANSACTION INTO THE DATABASE          (issue #64)
|==============================================================================
|
| sp_resolve_complaint used to only UPDATE the complaint, and the controller
| opened a PHP transaction around it and wrote the audit row itself.
|
| Now the procedure owns the whole operation: START TRANSACTION, the UPDATE,
| the INSERT into admin_activities, then COMMIT - plus an EXIT HANDLER that
| ROLLBACKs if anything fails.
|
| The rules and the atomicity now live in the same place, so ANY caller gets
| them, not just this one controller.
|
| A migration rather than editing 2026_09_26_000006, because teammates have
| already run that one and Laravel will not re-run it for them.
|
*/
return new class extends Migration
{
    public function up(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_resolve_complaint');

        $procedure = file_get_contents(
            database_path('procedures/sp_resolve_complaint.sql')
        );

        if ($procedure === false) {
            throw new RuntimeException('Could not read sp_resolve_complaint.sql');
        }

        DB::unprepared($procedure);
    }

    public function down(): void
    {
        DB::unprepared('DROP PROCEDURE IF EXISTS sp_resolve_complaint');
    }
};
