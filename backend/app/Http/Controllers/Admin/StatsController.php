<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| DASHBOARD STATISTICS  ->  GET /api/admin/stats        (issue #20)
|==============================================================================
|
| THE ONE IDEA IN THIS FILE
|
|     >> let the DATABASE do the counting, not PHP <<
|
| The tempting way is to fetch every row and count the array:
|
|     $pets  = SELECT * FROM pets;     <- drags every row across the network
|     $total = count($pets);           <- then counts them in PHP
|
| With 50,000 pets that transfers 50,000 rows to produce ONE number.
| The correct way asks MySQL for the number and transfers one value:
|
|     SELECT COUNT(*) FROM pets;
|
| COUNT() is an AGGREGATE function - so are SUM, AVG, MIN and MAX. They all
| work the same way: the arithmetic happens where the data already lives.
|
*/
class StatsController extends Controller
{
    public function index()
    {
        /*
        |----------------------------------------------------------------------
        | ALL THE HEADLINE NUMBERS IN ONE QUERY
        |----------------------------------------------------------------------
        |
        | Each line in the SELECT is a small SELECT of its own, in brackets.
        | A query inside a query is called a SUBQUERY.
        |
        | Doing it this way means ONE trip to the database instead of five.
        | Every round trip costs time, so five separate COUNT queries would be
        | five times the waiting for exactly the same answers.
        |
        | Each subquery must return exactly ONE value - one row, one column -
        | which COUNT(*) always does.
        |
        | The result is a single row that looks like:
        |
        |     total_shelters | total_pets | pending_complaints | ...
        |     3              | 6          | 0                  | ...
        */
        $counts = DB::selectOne(
            "SELECT
                 (SELECT COUNT(*) FROM shelters) AS total_shelters,

                 (SELECT COUNT(*) FROM pets)     AS total_pets,

                 -- WHERE goes INSIDE the brackets, so it applies only to this
                 -- count. Note the capital P: the complaints.status column is
                 -- an ENUM('Pending','Resolved','Rejected'), and the value has
                 -- to match exactly.
                 (SELECT COUNT(*) FROM complaints WHERE status = 'Pending')
                     AS pending_complaints,

                 (SELECT COUNT(*) FROM users)    AS total_users,

                 (SELECT COUNT(*) FROM applications) AS total_applications"
        );

        /*
        |----------------------------------------------------------------------
        | A BREAKDOWN PER CATEGORY, ALSO IN ONE QUERY
        |----------------------------------------------------------------------
        |
        | We want the shelter count for EACH status. Three separate queries
        | would work, but GROUP BY does the whole job at once:
        |
        |     SELECT status, COUNT(*) AS total
        |     FROM shelters
        |     GROUP BY status;
        |
        | GROUP BY collapses all rows sharing the same status into ONE output
        | row, and COUNT tells us how many were collapsed:
        |
        |     active   | 3
        |     pending  | 1
        |     inactive | 1
        |
        | The rule to remember: every column in the SELECT must either appear
        | in the GROUP BY, or be wrapped in an aggregate function like COUNT.
        */
        $shelterRows = DB::select(
            "SELECT status, COUNT(*) AS total FROM shelters GROUP BY status"
        );

        // Reshape the rows into ['active' => 3, 'pending' => 1] so we can look
        // each one up by name below.
        $byStatus = [];
        foreach ($shelterRows as $row) {
            $byStatus[$row->status] = $row->total;
        }

        // The same idea over the users table, grouped by the `role` column.
        $roleRows = DB::select(
            "SELECT role, COUNT(*) AS total FROM users GROUP BY role"
        );

        $byRole = [];
        foreach ($roleRows as $row) {
            $byRole[$row->role] = $row->total;
        }

        /*
        | ?? 0 means "if that key is missing, use 0 instead".
        |
        | It matters: GROUP BY only returns rows for statuses that actually
        | EXIST. If no shelter is inactive, there is no 'inactive' row at all,
        | and reading it without ?? would be an error rather than showing 0.
        */
        return response()->json([
            'message' => 'Statistics fetched successfully.',
            'stats'   => [
                // --- issue #20: the three the dashboard cards need ---
                'total_shelters'     => $counts->total_shelters,
                'total_pets'         => $counts->total_pets,
                'pending_complaints' => $counts->pending_complaints,

                // --- extra numbers the dashboard already showed ---
                'total_users'        => $counts->total_users,
                'total_applications' => $counts->total_applications,

                'active_shelters'    => $byStatus['active']   ?? 0,
                'pending_shelters'   => $byStatus['pending']  ?? 0,
                'inactive_shelters'  => $byStatus['inactive'] ?? 0,

                'total_adopters'     => $byRole['adopter']        ?? 0,
                'total_staff'        => $byRole['shelter_staff']  ?? 0,
                'total_admins'       => $byRole['platform_admin'] ?? 0,
            ],
        ]);
    }
}
