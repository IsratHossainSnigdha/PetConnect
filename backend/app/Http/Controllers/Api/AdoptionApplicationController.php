<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

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
        |--------------------------------------------------------------------------
        | Get applications belonging to the logged-in adopter
        |--------------------------------------------------------------------------
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
                pets.type AS petType,
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
        |--------------------------------------------------------------------------
        | Get only pets currently available for adoption
        |--------------------------------------------------------------------------
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
        |--------------------------------------------------------------------------
        | Validate pet ID
        |--------------------------------------------------------------------------
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
        | Call stored procedure
        |--------------------------------------------------------------------------
        |
        | The procedure:
        |
        | 1. Checks whether the pet exists.
        | 2. Checks whether the pet is available.
        | 3. Checks whether the adopter already has a pending
        |    application for the same pet.
        | 4. Creates the application.
        | 5. Returns the new application ID.
        |
        */

        try {

            $procedureResult = DB::select(
                'CALL create_adoption_application(?, ?)',
                [
                    $user->id,
                    $petId
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Get procedure result
            |--------------------------------------------------------------------------
            */

            $result = $procedureResult[0] ?? null;

            /*
            |--------------------------------------------------------------------------
            | Procedure returned no result
            |--------------------------------------------------------------------------
            */

            if (!$result) {
                return response()->json([
                    'message' =>
                        'Unable to create adoption application.'
                ], 500);
            }

            /*
            |--------------------------------------------------------------------------
            | Procedure returned an error
            |--------------------------------------------------------------------------
            */

            if (
                isset($result->result) &&
                $result->result === 'error'
            ) {
                return response()->json([
                    'message' =>
                        $result->message
                        ?? 'Unable to create adoption application.'
                ], 422);
            }

            /*
            |--------------------------------------------------------------------------
            | Make sure application ID was returned
            |--------------------------------------------------------------------------
            */

            if (
                !isset($result->application_id) ||
                !$result->application_id
            ) {
                return response()->json([
                    'message' =>
                        'Application was not created successfully.'
                ], 500);
            }

            /*
            |--------------------------------------------------------------------------
            | Get the newly-created application
            |--------------------------------------------------------------------------
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
                    pets.type AS petType,
                    pets.breed,
                    pets.age,
                    pets.gender,
                    pets.description,
                    pets.image AS petImage,

                    shelters.name AS shelter,
                    shelters.location AS shelterLocation

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
                    $result->application_id,
                    $user->id
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Application could not be found after creation
            |--------------------------------------------------------------------------
            */

            if (!$application) {
                return response()->json([
                    'message' =>
                        'Application was created, but could not be retrieved.'
                ], 500);
            }

            /*
            |--------------------------------------------------------------------------
            | SUCCESS RESPONSE
            |--------------------------------------------------------------------------
            */

            return response()->json([
                'message' =>
                    $result->message
                    ?? 'Application submitted successfully.',

                'application' => $application
            ], 201);

        } catch (QueryException $e) {

            /*
            |--------------------------------------------------------------------------
            | DATABASE ERROR
            |--------------------------------------------------------------------------
            |
            | Do not expose raw database errors to the frontend.
            |
            */

            return response()->json([
                'message' =>
                    'Unable to create adoption application.'
            ], 500);
        }
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
        |--------------------------------------------------------------------------
        | Get one application belonging to the logged-in adopter
        |--------------------------------------------------------------------------
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
                pets.type AS petType,
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
        | SUCCESS RESPONSE
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'application' => $application
        ]);
    }
}

