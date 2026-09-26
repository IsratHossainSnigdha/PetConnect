<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| REPORT CONTROLLER   (issue #42)
|==============================================================================
|
| Every report on this page is a VIEW in the database. The SQL that used to sit
| in this file now lives in database/views/report_views.sql, installed by the
| migration 2026_09_27_000002_create_report_views.
|
| WHAT A VIEW IS
|
|     A view is a stored SELECT - a saved QUESTION, not a saved answer. It
|     holds no data of its own. Every read re-runs the query underneath, so
|     the numbers are always current.
|
|     CREATE VIEW v_report_pets_by_type AS
|         SELECT type, COUNT(*) AS total FROM pets GROUP BY type;
|
|     ...after which "SELECT * FROM v_report_pets_by_type" behaves like a
|     table that is recalculated on the spot.
|
| WHY MOVE THEM THERE
|
|   * Written once. Any caller - this app, a teammate's script, a reporting
|     tool - gets identical numbers, because they read the same definition.
|   * The rules stop hiding inside PHP strings. If 'adopted' is ever renamed,
|     it is fixed in one file instead of hunted through controllers.
|   * This controller becomes impossible to get wrong: it is eight reads and
|     no logic.
|
| The aggregate reasoning - why LEFT JOIN and not JOIN, why COUNT(pets.id) and
| not COUNT(*), why COUNT(DISTINCT ...) across three tables, why HAVING rather
| than WHERE - is written out in report_views.sql next to the SQL it explains.
|
*/
class ReportController extends Controller
{
    /**
     * GET /api/admin/reports
     *
     * Returns every report in one response, so the page makes one request
     * instead of eight.
     *
     * selectOne for the overview because it is a single row of totals;
     * select for the rest because each returns a list.
     */
    public function index()
    {
        return response()->json([
            'message' => 'Reports generated successfully.',
            'reports' => [
                'overview' => DB::selectOne(
                    "SELECT * FROM v_report_overview"
                ),

                'pets_per_shelter' => DB::select(
                    "SELECT * FROM v_report_pets_per_shelter"
                ),

                'pets_by_status' => DB::select(
                    "SELECT * FROM v_report_pets_by_status"
                ),

                'pets_by_type' => DB::select(
                    "SELECT * FROM v_report_pets_by_type"
                ),

                'applications_by_status' => DB::select(
                    "SELECT * FROM v_report_applications_by_status"
                ),

                'applications_by_day' => DB::select(
                    "SELECT * FROM v_report_applications_by_day"
                ),

                'complaints_by_category' => DB::select(
                    "SELECT * FROM v_report_complaints_by_category"
                ),

                'busiest_shelters' => DB::select(
                    "SELECT * FROM v_report_busiest_shelters"
                ),
            ],
        ]);
    }
}
