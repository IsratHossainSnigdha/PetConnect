<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdoptionApplicationController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | GET ALL APPLICATIONS
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $user = $request->user();

        /*
        | Basic SQL with JOIN
        |
        | applications
        |      JOIN pets
        |      JOIN shelters
        |
        */

        $applications = DB::select(
            "
            SELECT
                applications.id,
                applications.adopter_id,
                applications.pet_id,
                applications.status,
                applications.created_at,

                pets.name AS petName,
                pets.type,
                pets.breed,
                pets.age,
                pets.gender,
                pets.image AS petImage,

                shelters.name AS shelter,
                shelters.location AS shelterLocation

            FROM applications

            INNER JOIN pets
                ON applications.pet_id = pets.id

            INNER JOIN shelters
                ON pets.shelter_id = shelters.id

            WHERE applications.adopter_id = ?

            ORDER BY applications.created_at DESC
            ",
            [$user->id]
        );

        return response()->json([
            'applications' => $applications
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | GET AVAILABLE PETS
    |--------------------------------------------------------------------------
    */

    public function pets()
    {
        /*
        | Basic SQL with JOIN
        |
        | Only pets with status = available
        | are shown in the Create Application modal.
        */

        $pets = DB::select(
            "
            SELECT
                pets.id,
                pets.name,
                pets.type,
                pets.breed,
                pets.age,
                pets.gender,
                pets.description,
                pets.image,
                pets.status,

                shelters.id AS shelter_id,
                shelters.name AS shelter,
                shelters.location AS shelterLocation

            FROM pets

            INNER JOIN shelters
                ON pets.shelter_id = shelters.id

            WHERE pets.status = ?

            ORDER BY pets.name ASC
            ",
            ['available']
        );

        return response()->json([
            'pets' => $pets
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | CREATE APPLICATION
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $user = $request->user();

        /*
        | Validate pet ID
        */

        $validated = $request->validate([
            'pet_id' => [
                'required',
                'integer',
            ],
        ]);

        $petId = $validated['pet_id'];


        /*
        |--------------------------------------------------------------------------
        | CHECK PET EXISTS
        |--------------------------------------------------------------------------
        */

        $pet = DB::selectOne(
            "
            SELECT
                id,
                name,
                status,
                shelter_id

            FROM pets

            WHERE id = ?
            ",
            [$petId]
        );

        if (!$pet) {
            return response()->json([
                'message' => 'Pet not found.'
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK PET IS AVAILABLE
        |--------------------------------------------------------------------------
        */

        if ($pet->status !== 'available') {
            return response()->json([
                'message' =>
                    'This pet is not currently available for adoption.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK DUPLICATE APPLICATION
        |--------------------------------------------------------------------------
        */

        $existingApplication = DB::selectOne(
            "
            SELECT
                id,
                status

            FROM applications

            WHERE adopter_id = ?
              AND pet_id = ?
              AND status IN (?, ?)

            LIMIT 1
            ",
            [
                $user->id,
                $petId,
                'Pending',
                'Approved'
            ]
        );

        if ($existingApplication) {
            return response()->json([
                'message' =>
                    'You have already applied for this pet.'
            ], 422);
        }


        /*
        |--------------------------------------------------------------------------
        | INSERT APPLICATION
        |--------------------------------------------------------------------------
        */

        DB::insert(
            "
            INSERT INTO applications
            (
                adopter_id,
                pet_id,
                status,
                created_at,
                updated_at
            )

            VALUES
            (
                ?,
                ?,
                ?,
                NOW(),
                NOW()
            )
            ",
            [
                $user->id,
                $petId,
                'Pending'
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | GET CREATED APPLICATION
        |--------------------------------------------------------------------------
        |
        | This JOIN gets the pet and shelter information
        | immediately after creating the application.
        |
        */

        $application = DB::selectOne(
            "
            SELECT
                applications.id,
                applications.adopter_id,
                applications.pet_id,
                applications.status,
                applications.created_at,

                pets.name AS petName,
                pets.type,
                pets.breed,

                shelters.name AS shelter

            FROM applications

            INNER JOIN pets
                ON applications.pet_id = pets.id

            INNER JOIN shelters
                ON pets.shelter_id = shelters.id

            WHERE applications.adopter_id = ?
              AND applications.pet_id = ?

            ORDER BY applications.id DESC

            LIMIT 1
            ",
            [
                $user->id,
                $petId
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' =>
                'Application submitted successfully.',

            'application' =>
                $application

        ], 201);
    }


    /*
    |--------------------------------------------------------------------------
    | GET ONE APPLICATION
    |--------------------------------------------------------------------------
    */

    public function show(
        Request $request,
        $id
    ) {
        $user = $request->user();

        /*
        | Basic SQL with JOIN
        */

        $application = DB::selectOne(
            "
            SELECT
                applications.id,
                applications.adopter_id,
                applications.pet_id,
                applications.status,
                applications.created_at,

                pets.name AS petName,
                pets.type,
                pets.breed,
                pets.age,
                pets.gender,
                pets.description,
                pets.image AS petImage,

                shelters.name AS shelter,
                shelters.location AS shelterLocation,
                shelters.contact_email AS shelterEmail,
                shelters.contact_phone AS shelterPhone

            FROM applications

            INNER JOIN pets
                ON applications.pet_id = pets.id

            INNER JOIN shelters
                ON pets.shelter_id = shelters.id

            WHERE applications.id = ?
              AND applications.adopter_id = ?

            LIMIT 1
            ",
            [
                $id,
                $user->id
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | APPLICATION NOT FOUND
        |--------------------------------------------------------------------------
        */

        if (!$application) {
            return response()->json([
                'message' =>
                    'Application not found.'
            ], 404);
        }


        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'application' => $application
        ]);
    }
}