<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| INSTALL sp_resolve_complaint                            (issue #62)
|==============================================================================
|
| Moves the "resolve a complaint" rules out of PHP and into the database.
|
| The checks that used to live in the controller - does the complaint exist, is
| it already resolved - now live in one place that every caller goes through,
| whether that is the admin page, another service, or someone typing SQL.
|
| It reports back through two OUT parameters rather than by returning a result
| set. That is deliberate: the controller calls this INSIDE a transaction and
| then runs more queries (the audit INSERT), and OUT parameters are read with
| an ordinary SELECT afterwards without leaving a pending result set on the
| connection.
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
