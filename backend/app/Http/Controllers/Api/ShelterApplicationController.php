<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class ShelterApplicationController extends Controller
{
    /**
     * Get all adoption requests belonging to the logged-in shelter.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user->shelter_id) {
            return response()->json([
                'message' => 'You are not assigned to any shelter.'
            ], 403);
        }

        $applications = DB::table('applications')
            ->join(
                'pets',
                'applications.pet_id',
                '=',
                'pets.id'
            )
            ->join(
                'users',
                'applications.adopter_id',
                '=',
                'users.id'
            )
            ->where('pets.shelter_id', $user->shelter_id)
            ->select(
                'applications.id',
                'applications.adopter_id',
                'applications.pet_id',
                'applications.status',
                'applications.created_at',
                'applications.updated_at',

                'users.name as adopter_name',
                'users.email as adopter_email',
                'users.phone as adopter_phone',
                'users.address as adopter_address',

                'pets.name as pet_name',
                'pets.type as pet_type',
                'pets.breed as pet_breed',
                'pets.age as pet_age',
                'pets.gender as pet_gender',
                'pets.status as pet_status',
                'pets.image as pet_image'
            )
            ->orderByDesc('applications.created_at')
            ->get();

        return response()->json([
            'message' => 'Adoption requests retrieved successfully.',
            'applications' => $applications
        ], 200);
    }


    /**
     * Get one adoption request.
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->shelter_id) {
            return response()->json([
                'message' => 'You are not assigned to any shelter.'
            ], 403);
        }

        $application = DB::table('applications')
            ->join(
                'pets',
                'applications.pet_id',
                '=',
                'pets.id'
            )
            ->join(
                'users',
                'applications.adopter_id',
                '=',
                'users.id'
            )
            ->where('applications.id', $id)
            ->where('pets.shelter_id', $user->shelter_id)
            ->select(
                'applications.id',
                'applications.adopter_id',
                'applications.pet_id',
                'applications.status',
                'applications.created_at',
                'applications.updated_at',

                'users.name as adopter_name',
                'users.email as adopter_email',
                'users.phone as adopter_phone',
                'users.address as adopter_address',

                'pets.name as pet_name',
                'pets.type as pet_type',
                'pets.breed as pet_breed',
                'pets.age as pet_age',
                'pets.gender as pet_gender',
                'pets.description as pet_description',
                'pets.image as pet_image',
                'pets.status as pet_status'
            )
            ->first();

        if (!$application) {
            return response()->json([
                'message' => 'Adoption request not found.'
            ], 404);
        }

        return response()->json([
            'application' => $application
        ], 200);
    }


    /**
     * APPROVE ADOPTION REQUEST
     *
     * All related database operations are performed
     * inside one transaction.
     */
    public function approve(Request $request, $id)
    {
        $user = $request->user();

        // ---------------------------------------------------------
        // 1. Check shelter assignment
        // ---------------------------------------------------------
        if (!$user->shelter_id) {
            return response()->json([
                'message' => 'You are not assigned to any shelter.'
            ], 403);
        }

        try {

            $application = DB::transaction(function () use ($user, $id) {

                // -------------------------------------------------
                // 2. Find and LOCK the application
                // -------------------------------------------------
                $application = DB::table('applications')
                    ->join(
                        'pets',
                        'applications.pet_id',
                        '=',
                        'pets.id'
                    )
                    ->where('applications.id', $id)
                    ->where('pets.shelter_id', $user->shelter_id)
                    ->select(
                        'applications.id',
                        'applications.adopter_id',
                        'applications.pet_id',
                        'applications.status as application_status',

                        'pets.name as pet_name',
                        'pets.status as pet_status',
                        'pets.shelter_id'
                    )
                    ->lockForUpdate()
                    ->first();

                // -------------------------------------------------
                // 3. Request does not exist
                // -------------------------------------------------
                if (!$application) {
                    abort(404, 'Adoption request not found.');
                }

                // -------------------------------------------------
                // 4. Request must be pending
                // -------------------------------------------------
                if (
                    strtolower($application->application_status)
                    !== 'pending'
                ) {
                    abort(
                        422,
                        'This adoption request has already been processed.'
                    );
                }

                // -------------------------------------------------
                // 5. Pet must still be available
                // -------------------------------------------------
                if (
                    strtolower($application->pet_status)
                    !== 'available'
                ) {
                    abort(
                        422,
                        'This pet is no longer available for adoption.'
                    );
                }

                // -------------------------------------------------
                // 6. APPROVE APPLICATION
                // -------------------------------------------------
                DB::table('applications')
                    ->where('id', $application->id)
                    ->update([
                        'status' => 'approved',
                        'updated_at' => now()
                    ]);


                // -------------------------------------------------
                // 7. MARK PET AS ADOPTED
                // -------------------------------------------------
                DB::table('pets')
                    ->where('id', $application->pet_id)
                    ->where('shelter_id', $user->shelter_id)
                    ->update([
                        'status' => 'Adopted',
                        'updated_at' => now()
                    ]);


                // -------------------------------------------------
                // 8. REJECT OTHER PENDING APPLICATIONS
                // -------------------------------------------------
                DB::table('applications')
                    ->where('pet_id', $application->pet_id)
                    ->where('id', '!=', $application->id)
                    ->where('status', 'pending')
                    ->update([
                        'status' => 'rejected',
                        'updated_at' => now()
                    ]);


                // -------------------------------------------------
                // 9. NOTIFY THE APPROVED ADOPTER
                // -------------------------------------------------
                DB::table('notifications')->insert([
                    'user_id' => $application->adopter_id,
                    'title' => 'Adoption Request Approved',
                    'message' => 'Your adoption request for '
                        . $application->pet_name
                        . ' has been approved.',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);


                // -------------------------------------------------
                // 10. NOTIFY OTHER REJECTED ADOPTERS
                // -------------------------------------------------
                $rejectedAdopters = DB::table('applications')
                    ->where('pet_id', $application->pet_id)
                    ->where('id', '!=', $application->id)
                    ->where('status', 'rejected')
                    ->pluck('adopter_id');

                foreach ($rejectedAdopters as $adopterId) {

                    DB::table('notifications')->insert([
                        'user_id' => $adopterId,
                        'title' => 'Adoption Request Rejected',
                        'message' => 'Your adoption request for '
                            . $application->pet_name
                            . ' was not approved because the pet has '
                            . 'been adopted by another applicant.',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }


                // -------------------------------------------------
                // 11. RETURN UPDATED APPLICATION
                // -------------------------------------------------
                return DB::table('applications')
                    ->join(
                        'pets',
                        'applications.pet_id',
                        '=',
                        'pets.id'
                    )
                    ->join(
                        'users',
                        'applications.adopter_id',
                        '=',
                        'users.id'
                    )
                    ->where('applications.id', $application->id)
                    ->select(
                        'applications.id',
                        'applications.adopter_id',
                        'applications.pet_id',
                        'applications.status',
                        'applications.created_at',
                        'applications.updated_at',

                        'users.name as adopter_name',
                        'users.email as adopter_email',

                        'pets.name as pet_name',
                        'pets.status as pet_status'
                    )
                    ->first();
            });


            // -----------------------------------------------------
            // TRANSACTION SUCCESSFULLY COMMITTED
            // -----------------------------------------------------

            return response()->json([
                'message' => 'Adoption request approved successfully.',
                'application' => $application
            ], 200);

        } catch (QueryException $e) {

            // DB::transaction() automatically rolls back
            // when a QueryException occurs.

            return response()->json([
                'message' => 'Failed to approve adoption request.',
                'error' => 'A database error occurred. No changes were saved.'
            ], 500);

        } catch (\Throwable $e) {

            // Any exception also causes DB::transaction()
            // to roll back.

            return response()->json([
                'message' => $e->getMessage(),
                'error' => 'Adoption approval failed. No changes were saved.'
            ], 500);
        }
    }


    /**
     * REJECT ADOPTION REQUEST
     */
    public function reject(Request $request, $id)
    {
        $user = $request->user();

        if (!$user->shelter_id) {
            return response()->json([
                'message' => 'You are not assigned to any shelter.'
            ], 403);
        }

        try {

            $application = DB::table('applications')
                ->join(
                    'pets',
                    'applications.pet_id',
                    '=',
                    'pets.id'
                )
                ->where('applications.id', $id)
                ->where('pets.shelter_id', $user->shelter_id)
                ->select(
                    'applications.id',
                    'applications.adopter_id',
                    'applications.status',
                    'applications.pet_id',
                    'pets.name as pet_name'
                )
                ->first();

            if (!$application) {
                return response()->json([
                    'message' => 'Adoption request not found.'
                ], 404);
            }

            if (
                strtolower($application->status)
                !== 'pending'
            ) {
                return response()->json([
                    'message' => 'This adoption request has already been processed.'
                ], 422);
            }

            // -----------------------------------------------------
            // Reject request + notification in ONE transaction
            // -----------------------------------------------------

            DB::transaction(function () use ($application) {

                // Update application
                DB::table('applications')
                    ->where('id', $application->id)
                    ->update([
                        'status' => 'rejected',
                        'updated_at' => now()
                    ]);

                // Notify adopter
                DB::table('notifications')->insert([
                    'user_id' => $application->adopter_id,
                    'title' => 'Adoption Request Rejected',
                    'message' => 'Your adoption request for '
                        . $application->pet_name
                        . ' has been rejected.',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            });

            return response()->json([
                'message' => 'Adoption request rejected successfully.'
            ], 200);

        } catch (QueryException $e) {

            return response()->json([
                'message' => 'Failed to reject adoption request.',
                'error' => 'A database error occurred. No changes were saved.'
            ], 500);

        } catch (\Throwable $e) {

            return response()->json([
                'message' => $e->getMessage(),
                'error' => 'Adoption rejection failed. No changes were saved.'
            ], 500);
        }
    }
}