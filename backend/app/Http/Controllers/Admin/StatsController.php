<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| STATS CONTROLLER  -  the numbers on the admin dashboard cards
|--------------------------------------------------------------------------
|
| This file is a good demonstration of one idea:
|
|     >> make the DATABASE do the counting, not PHP <<
|
| The tempting version is:
|
|     $users = User::all();          // pulls EVERY row across the network
|     $total = count($users);        // then counts them in PHP
|
| With 50,000 users that loads 50,000 objects into memory just to produce one
| number. The correct version asks MySQL for the number and transfers 1 value:
|
|     SELECT COUNT(*) FROM users;
|
| This is called an AGGREGATE function. COUNT, SUM, AVG, MIN and MAX all work
| the same way - the work happens where the data already lives.
|
*/
class StatsController extends Controller
{
    /**
     * GET /api/admin/stats
     */
    public function index()
    {
        // SELECT COUNT(*) FROM shelters;
        $totalShelters = Shelter::count();

        /*
        | GROUP BY: count the shelters in each status with ONE query instead of
        | running three separate COUNT queries.
        |
        |     SELECT status, COUNT(*) AS total
        |     FROM shelters
        |     GROUP BY status;
        |
        | GROUP BY collapses all rows sharing a status into a single output row,
        | and the aggregate is calculated per group:
        |
        |     active   | 3
        |     pending  | 1
        |     inactive | 1
        |
        | pluck('total','status') then reshapes that result set into the handy
        | PHP array ['active' => 3, 'pending' => 1, 'inactive' => 1].
        |
        | This query is the reason we put an index on `status` in the migration.
        */
        $byStatus = Shelter::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        // Same trick over the users table, grouped by the `role` ENUM.
        $usersByRole = User::query()
            ->selectRaw('role, COUNT(*) as total')
            ->groupBy('role')
            ->pluck('total', 'role');

        return response()->json([
            'message' => 'Statistics fetched successfully.',
            'stats'   => [
                'total_shelters'    => $totalShelters,
                'active_shelters'   => $byStatus['active']   ?? 0,
                'pending_shelters'  => $byStatus['pending']  ?? 0,
                'inactive_shelters' => $byStatus['inactive'] ?? 0,

                // SELECT COUNT(*) FROM users;
                'total_users'       => User::count(),
                'total_adopters'    => $usersByRole['adopter']        ?? 0,
                'total_staff'       => $usersByRole['shelter_staff']  ?? 0,
                'total_admins'      => $usersByRole['platform_admin'] ?? 0,

                // A shelter with no staff account attached yet.
                //
                // doesntHave('staff') builds a NOT EXISTS subquery:
                //     SELECT COUNT(*) FROM shelters
                //     WHERE NOT EXISTS (SELECT 1 FROM users
                //                       WHERE users.shelter_id = shelters.id);
                //
                // Expressing "rows in A with no matching row in B" this way is
                // far clearer - and usually faster - than fetching both tables
                // and comparing them in PHP.
                'unstaffed_shelters' => Shelter::doesntHave('staff')->count(),
            ],
        ]);
    }
}
