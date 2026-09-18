<?php

namespace App\Http\Controllers\Adopter;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdopterDashboardController extends Controller
{
    /**
     * Return dashboard data for the authenticated adopter.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | ROLE CHECK
        |--------------------------------------------------------------------------
        */

        if ($user->role !== 'adopter') {
            return response()->json([
                'message' => 'Unauthorized. Adopter access required.',
            ], 403);
        }


        /*
        |--------------------------------------------------------------------------
        | APPLICATION STATISTICS
        |--------------------------------------------------------------------------
        |
        | Using basic SQL COUNT queries.
        |
        */

        $totalResult = DB::select(
            "
            SELECT COUNT(*) AS total
            FROM applications
            WHERE adopter_id = ?
            ",
            [$user->id]
        );

        $totalApplications = $totalResult[0]->total;


        $pendingResult = DB::select(
            "
            SELECT COUNT(*) AS total
            FROM applications
            WHERE adopter_id = ?
            AND status = ?
            ",
            [$user->id, 'pending']
        );

        $pendingApplications = $pendingResult[0]->total;


        $approvedResult = DB::select(
            "
            SELECT COUNT(*) AS total
            FROM applications
            WHERE adopter_id = ?
            AND status = ?
            ",
            [$user->id, 'approved']
        );

        $approvedApplications = $approvedResult[0]->total;


        $rejectedResult = DB::select(
            "
            SELECT COUNT(*) AS total
            FROM applications
            WHERE adopter_id = ?
            AND status = ?
            ",
            [$user->id, 'rejected']
        );

        $rejectedApplications = $rejectedResult[0]->total;


        /*
        |--------------------------------------------------------------------------
        | APPLICATION LIST
        |--------------------------------------------------------------------------
        |
        | Raw SQL JOIN query.
        |
        | applications
        |       ↓
        |      pets
        |       ↓
        |    shelters
        |
        */

        $applications = DB::select(
            "
            SELECT
                applications.id,
                applications.status,
                applications.created_at,

                pets.name AS pet_name,
                pets.type AS pet_type,

                shelters.name AS shelter_name

            FROM applications

            LEFT JOIN pets
                ON applications.pet_id = pets.id

            LEFT JOIN shelters
                ON pets.shelter_id = shelters.id

            WHERE applications.adopter_id = ?

            ORDER BY applications.created_at DESC
            ",
            [$user->id]
        );


        /*
        |--------------------------------------------------------------------------
        | FORMAT APPLICATION DATA
        |--------------------------------------------------------------------------
        */

        $formattedApplications = collect($applications)->map(function ($application) {

            return [
                'id' => $application->id,

                'petName' => $application->pet_name,

                'petType' => $application->pet_type,

                'status' => ucfirst($application->status),

                'shelter' => $application->shelter_name,

                'date' => $application->created_at
                    ? \Carbon\Carbon::parse(
                        $application->created_at
                    )->format('M d, Y')
                    : null,
            ];

        })->values();


        /*
        |--------------------------------------------------------------------------
        | API RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([

            'stats' => [

                'total' => $totalApplications,

                'pending' => $pendingApplications,

                'approved' => $approvedApplications,

                'rejected' => $rejectedApplications,

            ],

            'applications' => $formattedApplications,

        ]);
    }
}