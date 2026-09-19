<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Shelter;

class ShelterController extends Controller
{
    // ========================================
    // FETCH ALL SHELTERS
    // ========================================

    public function index()
    {
        try {

            $shelters = Shelter::all();

            return response()->json($shelters, 200);

        } catch (\Exception $e) {

            return response()->json([
                'error' => 'Failed to fetch shelters',
                'message' => $e->getMessage()
            ], 500);
        }
    }


    // ========================================
    // SHELTER DASHBOARD
    // ========================================

    public function dashboardStats(Request $request)
    {
        try {

            $user = $request->user();

            // ----------------------------------------
            // CHECK SHELTER STAFF
            // ----------------------------------------

            if (!$user) {
                return response()->json([
                    'message' => 'Unauthenticated.'
                ], 401);
            }

            if (!$user->shelter_id) {
                return response()->json([
                    'message' => 'This account is not assigned to a shelter.'
                ], 403);
            }

            $shelterId = $user->shelter_id;


            // ========================================
            // PET STATISTICS
            // ========================================

            $totalPets = DB::table('pets')
                ->where('shelter_id', $shelterId)
                ->count();


            $availablePets = DB::table('pets')
                ->where('shelter_id', $shelterId)
                ->whereRaw('LOWER(status) = ?', ['available'])
                ->count();


            $treatmentPets = DB::table('pets')
                ->where('shelter_id', $shelterId)
                ->whereRaw('LOWER(status) = ?', ['treatment'])
                ->count();


            $adoptedPets = DB::table('pets')
                ->where('shelter_id', $shelterId)
                ->whereRaw('LOWER(status) = ?', ['adopted'])
                ->count();


            // ========================================
            // PENDING APPLICATIONS
            // ========================================

            $pendingApplications = DB::table('applications')
                ->join(
                    'pets',
                    'applications.pet_id',
                    '=',
                    'pets.id'
                )
                ->where(
                    'pets.shelter_id',
                    $shelterId
                )
                ->whereRaw(
                    'LOWER(applications.status) = ?',
                    ['pending']
                )
                ->count();


            // ========================================
            // STATS
            // ========================================

            $stats = [
                'total' => $totalPets,
                'available' => $availablePets,
                'treatment' => $treatmentPets,
                'adopted' => $adoptedPets,
                'pending' => $pendingApplications,
            ];


            // ========================================
            // RECENT PETS
            // ========================================

            $recentPets = DB::table('pets')
                ->where(
                    'shelter_id',
                    $shelterId
                )
                ->orderByDesc('created_at')
                ->limit(5)
                ->get();


            // ========================================
            // RECENT ADOPTION REQUESTS
            // ========================================

            $adoptionRequests = DB::table('applications')
                ->join(
                    'pets',
                    'applications.pet_id',
                    '=',
                    'pets.id'
                )
                ->leftJoin(
                    'users',
                    'applications.adopter_id',
                    '=',
                    'users.id'
                )
                ->where(
                    'pets.shelter_id',
                    $shelterId
                )
                ->select([
                    'applications.id',
                    'applications.adopter_id',
                    'applications.pet_id',
                    'applications.status',
                    'applications.created_at',

                    'users.name as user_name',
                    'users.email as user_email',

                    'pets.name as pet_name',
                    'pets.type as pet_type',
                    'pets.breed as pet_breed',
                ])
                ->orderByDesc(
                    'applications.created_at'
                )
                ->limit(5)
                ->get()
                ->map(function ($request) {

                    return [
                        'id' => $request->id,

                        'adopter_id' => $request->adopter_id,

                        'pet_id' => $request->pet_id,

                        'name' => $request->user_name
                            ?? 'Unknown User',

                        'email' => $request->user_email
                            ?? '',

                        'pet' => $request->pet_name
                            ?? 'Unknown Pet',

                        'pet_type' => $request->pet_type
                            ?? '',

                        'pet_breed' => $request->pet_breed
                            ?? '',

                        'date' => $request->created_at
                            ? \Carbon\Carbon::parse(
                                $request->created_at
                            )->diffForHumans()
                            : '',

                        'status' => strtolower(
                            $request->status ?? 'pending'
                        ),
                    ];
                });


            // ========================================
            // RESPONSE
            // ========================================

            return response()->json([
                'stats' => $stats,

                'pets' => $recentPets,

                'adoptionRequests' => $adoptionRequests,
            ], 200);


        } catch (\Throwable $e) {

            return response()->json([
                'message' => 'Failed to load shelter dashboard.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}