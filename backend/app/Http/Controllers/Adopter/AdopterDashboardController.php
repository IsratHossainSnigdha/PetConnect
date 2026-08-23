<?php

namespace App\Http\Controllers\Adopter;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
         * Get applications submitted by the authenticated adopter.
         *
         * with() loads the related pet and shelter in advance so
         * we don't run unnecessary database queries for every application.
         */
        $applications = $user->applications()
            ->with([
                'pet.shelter',
            ])
            ->latest()
            ->get();

        /*
         * Application statistics.
         */
        $totalApplications = $applications->count();

        $pendingApplications = $applications
            ->where('status', 'pending')
            ->count();

        $approvedApplications = $applications
            ->where('status', 'approved')
            ->count();

        $rejectedApplications = $applications
            ->where('status', 'rejected')
            ->count();

        /*
         * Format applications for the React dashboard.
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