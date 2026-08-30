<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| STATS CONTROLLER  -  the numbers on the admin dashboard cards
|==============================================================================
|
| Written in raw SQL. The one idea this file demonstrates is:
|
|     >> make the DATABASE do the counting, not PHP <<
|
| The tempting way is to fetch every row and count the array in PHP. With
| 50,000 users that drags 50,000 rows across the network to produce a single
| number. The correct way asks MySQL for the number and transfers one value:
|
|     SELECT COUNT(*) FROM users;
|
| COUNT is an AGGREGATE function. SUM, AVG, MIN and MAX all work the same way:
| the arithmetic happens where the data already lives.
|
*/
class StatsController extends Controller
{
    /**
     * GET /api/admin/stats
     */
    public function index()
    {
        /*
        | selectOne() returns a single row, so we can read ->total straight off
        | it. "AS total" names the result column - without it the column would
        | literally be called "COUNT(*)", which is awkward to read in PHP.
        */
        $totalShelters = DB::selectOne(
            "SELECT COUNT(*) AS total FROM shelters"
        )->total;

        $totalUsers = DB::selectOne(
            "SELECT COUNT(*) AS total FROM users"
        )->total;

        /*
        |----------------------------------------------------------------------
        | GROUP BY - counting each category in ONE query
        |----------------------------------------------------------------------
        |
        | We need the shelter count per status. The naive way is three separate
        | queries (one per status). GROUP BY does all of it at once:
        |
        |     SELECT status, COUNT(*) AS total
        |     FROM shelters
        |     GROUP BY status;
        |
        | GROUP BY collapses every row sharing the same status into ONE output
        | row, and COUNT tells us how many were collapsed:
        |
        |     active   | 3
        |     pending  | 1
        |     inactive | 1
        |
        | Rule to remember: every column in the SELECT must either appear in
        | the GROUP BY, or be wrapped in an aggregate function like COUNT.
        |
        | This query is the reason the migration put an index on `status`.
        */
        $shelterRows = DB::select(
            "SELECT status, COUNT(*) AS total
             FROM shelters
             GROUP BY status"
        );

        // Reshape the rows into ['active' => 3, 'pending' => 1, ...] so we can
        // look each one up by name below.
        $byStatus = [];
        foreach ($shelterRows as $row) {
            $byStatus[$row->status] = $row->total;
        }

        // The same trick over the users table, grouped by the `role` column.
        $roleRows = DB::select(
            "SELECT role, COUNT(*) AS total
             FROM users
             GROUP BY role"
        );

        $byRole = [];
        foreach ($roleRows as $row) {
            $byRole[$row->role] = $row->total;
        }

        /*
        |----------------------------------------------------------------------
        | NOT EXISTS - "rows in A with no matching row in B"
        |----------------------------------------------------------------------
        |
        | A shelter with no staff account attached yet.
        |
        |     SELECT COUNT(*) FROM shelters
        |     WHERE NOT EXISTS (
        |         SELECT 1 FROM users WHERE users.shelter_id = shelters.id
        |     );
        |
        | The inner query is a SUBQUERY - a query inside a query. For each
        | shelter, MySQL asks "is there any user pointing at me?" and NOT
        | EXISTS keeps only the shelters where the answer is no.
        |
        | "SELECT 1" looks odd but is deliberate: EXISTS only cares WHETHER a
        | row was found, never what is in it, so we do not waste effort
        | fetching real columns.
        */
        $unstaffed = DB::selectOne(
            "SELECT COUNT(*) AS total
             FROM shelters
             WHERE NOT EXISTS (
                 SELECT 1 FROM users WHERE users.shelter_id = shelters.id
             )"
        )->total;

        return response()->json([
            'message' => 'Statistics fetched successfully.',
            'stats'   => [
                'total_shelters'    => $totalShelters,
                'active_shelters'   => $byStatus['active']   ?? 0,
                'pending_shelters'  => $byStatus['pending']  ?? 0,
                'inactive_shelters' => $byStatus['inactive'] ?? 0,

                'total_users'       => $totalUsers,
                'total_adopters'    => $byRole['adopter']        ?? 0,
                'total_staff'       => $byRole['shelter_staff']  ?? 0,
                'total_admins'      => $byRole['platform_admin'] ?? 0,

                'unstaffed_shelters' => $unstaffed,
            ],
        ]);
    }
}
