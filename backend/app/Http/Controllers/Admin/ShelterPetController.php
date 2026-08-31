<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/*
|==============================================================================
| SHELTER PET CONTROLLER  -  managing the animals that live at one shelter
|==============================================================================
|
| Until now nothing in the API could CREATE a pet. Api\PetController has a
| single index() method, so every pet in the database came from the seeder.
| A shelter you cannot put animals into is not really functional, so this adds
| the missing half.
|
| NESTED ROUTES
|
|     POST   /api/admin/shelters/5/pets       add a pet to shelter 5
|     PUT    /api/admin/shelters/5/pets/9     edit pet 9
|     DELETE /api/admin/shelters/5/pets/9     remove pet 9
|
| The shelter id sits in the URL rather than in the request body, and that is
| deliberate. It means the shelter a pet belongs to is decided by WHICH URL
| you called, not by a number the browser can change. Every method below also
| re-checks that the pet really belongs to the shelter in the URL.
|
| That check matters. Without it, PUT /shelters/5/pets/9 would happily edit
| pet 9 even if it lived at shelter 3 - the URL would be lying and nothing
| would notice.
|
*/
class ShelterPetController extends Controller
{
    /**
     * LIST the pets of one shelter  ->  GET /api/admin/shelters/{shelter}/pets
     */
    public function index($shelterId)
    {
        /*
        | The ER diagram's "lives" relationship, read from the pets side:
        | pets m—1 shelter, so the foreign key is on pets and we filter by it.
        */
        $pets = DB::select(
            "SELECT id, name, type, breed, age, gender,
                    health_status, vaccine_status, status, description, image,
                    created_at
             FROM pets
             WHERE shelter_id = ?
             ORDER BY name",
            [$shelterId]
        );

        return response()->json([
            'message' => 'Pets fetched successfully.',
            'count'   => count($pets),
            'pets'    => $pets,
        ]);
    }

    /**
     * ADD a pet  ->  POST /api/admin/shelters/{shelter}/pets
     */
    public function store(Request $request, $shelterId)
    {
        // Does the shelter in the URL actually exist? The foreign key would
        // reject a bad id anyway, but with a raw SQL error rather than a
        // message anyone can read.
        $shelter = DB::selectOne("SELECT id FROM shelters WHERE id = ?", [$shelterId]);

        if (! $shelter) {
            return response()->json(['message' => 'Shelter not found.'], 404);
        }

        $data = $this->validatePet($request);

        /*
        |     INSERT INTO pets (...) VALUES (...);
        |
        | shelter_id comes from the URL, never from the request body, so a pet
        | cannot be filed under a shelter the caller was not addressing.
        |
        | NOW() fills created_at and updated_at. Raw SQL has nothing doing that
        | for us the way an Eloquent model would.
        */
        DB::insert(
            "INSERT INTO pets
                (shelter_id, name, type, breed, age, gender,
                 health_status, vaccine_status, status, description, image,
                 created_at, updated_at)
             VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
            [
                $shelterId,
                $data['name'],
                $data['type'],
                $data['breed']          ?? null,
                $data['age']            ?? null,
                $data['gender']         ?? null,
                $data['health_status']  ?? null,
                $data['vaccine_status'] ?? null,
                $data['status']         ?? 'available',
                $data['description']    ?? null,
                $data['image']          ?? null,
            ]
        );

        $newId = DB::getPdo()->lastInsertId();

        return response()->json([
            'message' => 'Pet added successfully.',
            'pet'     => DB::selectOne("SELECT * FROM pets WHERE id = ?", [$newId]),
        ], 201);
    }

    /**
     * EDIT a pet  ->  PUT /api/admin/shelters/{shelter}/pets/{pet}
     */
    public function update(Request $request, $shelterId, $petId)
    {
        /*
        | Check the pet exists AND belongs to this shelter, in one query.
        |
        | Both conditions matter. Checking only the id would let the URL claim
        | a pet belongs to a shelter it does not.
        */
        $pet = DB::selectOne(
            "SELECT id FROM pets WHERE id = ? AND shelter_id = ?",
            [$petId, $shelterId]
        );

        if (! $pet) {
            return response()->json([
                'message' => 'That pet does not exist at this shelter.',
            ], 404);
        }

        $data = $this->validatePet($request);

        /*
        |     UPDATE pets SET ... WHERE id = ? AND shelter_id = ?;
        |
        | Both conditions again, so even a mistake elsewhere cannot let this
        | statement touch another shelter's animal.
        |
        | The WHERE is the half that matters. Without it, this would rewrite
        | every pet in the table, and there is no undo.
        */
        DB::update(
            "UPDATE pets SET
                 name           = ?,
                 type           = ?,
                 breed          = ?,
                 age            = ?,
                 gender         = ?,
                 health_status  = ?,
                 vaccine_status = ?,
                 status         = ?,
                 description    = ?,
                 image          = ?,
                 updated_at     = NOW()
             WHERE id = ? AND shelter_id = ?",
            [
                $data['name'],
                $data['type'],
                $data['breed']          ?? null,
                $data['age']            ?? null,
                $data['gender']         ?? null,
                $data['health_status']  ?? null,
                $data['vaccine_status'] ?? null,
                $data['status'],
                $data['description']    ?? null,
                $data['image']          ?? null,
                $petId,
                $shelterId,
            ]
        );

        return response()->json([
            'message' => 'Pet updated successfully.',
            'pet'     => DB::selectOne("SELECT * FROM pets WHERE id = ?", [$petId]),
        ]);
    }

    /**
     * REMOVE a pet  ->  DELETE /api/admin/shelters/{shelter}/pets/{pet}
     */
    public function destroy($shelterId, $petId)
    {
        // Count the applications first - once the pet is gone, so are they,
        // and we want to tell the admin what was lost.
        $apps = DB::selectOne(
            "SELECT COUNT(*) AS total FROM applications WHERE pet_id = ?",
            [$petId]
        );

        /*
        |     DELETE FROM pets WHERE id = ? AND shelter_id = ?;
        |
        | applications.pet_id was created with ON DELETE CASCADE, so MySQL
        | removes this pet's adoption applications in the same statement. We do
        | not write a second DELETE - letting the database enforce it means it
        | cannot be forgotten.
        |
        | DB::delete() returns how many rows it removed, so 0 means the pet was
        | not found at this shelter.
        */
        $deleted = DB::delete(
            "DELETE FROM pets WHERE id = ? AND shelter_id = ?",
            [$petId, $shelterId]
        );

        if ($deleted === 0) {
            return response()->json([
                'message' => 'That pet does not exist at this shelter.',
            ], 404);
        }

        return response()->json([
            'message'              => 'Pet removed successfully.',
            'deleted_applications' => $apps->total,
        ]);
    }

    /**
     * The validation rules, written once and used by both store() and update().
     *
     * Every "in:" list below repeats an ENUM from the migration. Keep the two
     * in step - if they drift, validation passes and then the INSERT fails
     * with a raw SQL error instead of a readable message.
     */
    private function validatePet(Request $request)
    {
        return $request->validate([
            'name'           => ['required', 'string', 'max:255'],
            'type'           => ['required', 'string', 'max:255'],
            'breed'          => ['nullable', 'string', 'max:255'],

            // An age cannot be negative, and 60 is generous for any pet.
            'age'            => ['nullable', 'integer', 'min:0', 'max:60'],

            'gender'         => ['nullable', 'in:Male,Female'],
            'health_status'  => ['nullable', 'in:healthy,treatment,critical'],
            'vaccine_status' => ['nullable', 'in:vaccinated,partial,not_vaccinated'],
            'status'         => ['required', 'in:available,pending,adopted'],
            'description'    => ['nullable', 'string'],
            'image'          => ['nullable', 'string', 'max:255'],
        ]);
    }
}
