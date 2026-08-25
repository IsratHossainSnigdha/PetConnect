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

        // Only adopters can access this dashboard.
        if ($user->role !== 'adopter') {
            return response()->json([
                'message' => 'Unauthorized. Adopter access required.',
            ], 403);
        }

        /*
         * ==========================================
         * APPLICATION STATISTICS
         * ==========================================
         *
         * Basic SQL COUNT() is used here.
         *
         * The count is calculated only for the
         * currently authenticated adopter.
         */

        $totalApplications = DB::table('applications')
            ->where('adopter_id', $user->id)
            ->count();

        $pendingApplications = DB::table('applications')
            ->where('adopter_id', $user->id)
            ->where('status', 'pending')
            ->count();

        $approvedApplications = DB::table('applications')
            ->where('adopter_id', $user->id)
            ->where('status', 'approved')
            ->count();

        $rejectedApplications = DB::table('applications')
            ->where('adopter_id', $user->id)
            ->where('status', 'rejected')
            ->count();


        /*
         * ==========================================
         * APPLICATION LIST
         * ==========================================
         */

        $applications = $user->applications()
            ->with([
                'pet.shelter',
            ])
            ->latest()
            ->get();


        /*
         * ==========================================
         * FORMAT APPLICATIONS
         * ==========================================
         */

        $formattedApplications = $applications->map(function ($application) {
            return [
                'id' => $application->id,

                'petName' => $application->pet?->name,

                'petType' => $application->pet?->type,

                'status' => ucfirst($application->status),

                'shelter' => $application->pet?->shelter?->name,

                'date' => $application->created_at?->format('M d, Y'),
            ];
        });


        /*
         * ==========================================
         * API RESPONSE
         * ==========================================
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