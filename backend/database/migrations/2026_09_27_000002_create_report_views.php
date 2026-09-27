<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| INSTALL THE REPORT VIEWS
|==============================================================================
|
| A VIEW is a stored SELECT - a saved question, not a saved answer. It holds no
| data; reading it re-runs the query underneath, so the numbers are always
| current.
|
| The admin reports page used to build eight queries in PHP. They now live in
| database/views/report_views.sql, and the controller just reads them.
|
| The .sql file holds all eight separated by a marker line, because they belong
| together and are always installed as a set.
|
*/
return new class extends Migration
{
    /**
     * The views this migration owns, in the order they appear in the .sql file.
     * Kept here too so down() knows what to drop.
     */
    private array $views = [
        'v_report_overview',
        'v_report_pets_per_shelter',
        'v_report_pets_by_status',
        'v_report_pets_by_type',
        'v_report_applications_by_status',
        'v_report_applications_by_day',
        'v_report_complaints_by_category',
        'v_report_busiest_shelters',
    ];

    public function up(): void
    {
        $sql = file_get_contents(database_path('views/report_views.sql'));

        if ($sql === false) {
            throw new RuntimeException('Could not read report_views.sql');
        }

        /*
        | Split on the marker lines. Each piece is ONE complete statement,
        | which matters because DB::unprepared sends what it is given straight
        | to the driver - handing it eight statements at once is asking for
        | trouble.
        |
        | The /m flag makes ^ and $ match at each line rather than only at the
        | start and end of the whole string.
        */
        $statements = preg_split('/^-- >>>> NEXT VIEW$/m', $sql);

        foreach ($statements as $statement) {
            $statement = trim($statement);

            // The first piece is the file's header comment block, and a stray
            // blank piece is possible after a trailing marker. Skip anything
            // that is not actually a CREATE.
            if ($statement === '' || stripos($statement, 'CREATE') === false) {
                continue;
            }

            // Each statement is CREATE OR REPLACE VIEW, so re-running this
            // migration simply overwrites the previous definition - no DROP
            // needed, and no error if the view already exists.
            DB::unprepared($statement);
        }
    }

    public function down(): void
    {
        foreach ($this->views as $view) {
            DB::unprepared("DROP VIEW IF EXISTS {$view}");
        }
    }
};
