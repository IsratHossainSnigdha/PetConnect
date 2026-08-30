<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/*
|==============================================================================
| SHELTER STAFF SIGNUP  ->  POST /api/auth/shelter/register
|==============================================================================
|
| ONE form, TWO tables. Signing up creates:
|
|     1. a row in `shelters`  (the organisation)
|     2. a row in `users`     (the person), pointing at it via shelter_id
|
| This is the most interesting signup in the project, because it is the one
| that has to write to two tables at once.
|
*/
class ShelterRegisterController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'staffName'     => ['required', 'regex:/^[A-Za-z\s]+$/'],
            'shelterName'   => ['required', 'regex:/^[A-Za-z\s]+$/'],
            'shelterNumber' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'staffNumber'   => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'email'         => ['required', 'email'],
            'password'      => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        // Normalise once, then use the same value for both tables so the two
        // rows can never disagree about the address.
        $email = strtolower($validated['email']);

        /*
        | Check both tables before writing anything.
        |
        | This email becomes the staff login AND the shelter's public contact,
        | and both of those columns are UNIQUE. The shelter name is unique too.
        */
        $clash = DB::selectOne(
            "SELECT
                 (SELECT COUNT(*) FROM users    WHERE email = ?)         AS user_email,
                 (SELECT COUNT(*) FROM shelters WHERE contact_email = ?) AS shelter_email,
                 (SELECT COUNT(*) FROM shelters WHERE name = ?)          AS shelter_name",
            [$email, $email, $validated['shelterName']]
        );

        $errors = [];
        if ($clash->user_email > 0 || $clash->shelter_email > 0) {
            $errors['email'] = ['This email is already registered.'];
        }
        if ($clash->shelter_name > 0) {
            $errors['shelterName'] = ['A shelter with this name already exists.'];
        }

        if ($errors) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors'  => $errors,
            ], 422);
        }

        /*
        |----------------------------------------------------------------------
        | WHY THIS MUST BE A TRANSACTION
        |----------------------------------------------------------------------
        |
        | We are writing to two tables. Without a transaction this failure is
        | possible:
        |
        |     INSERT INTO shelters ... -> succeeds
        |     INSERT INTO users ...    -> fails (crash, disk full, race)
        |
        | leaving a shelter in the database that nobody can log in to - a row
        | that should never have existed on its own.
        |
        | A transaction wraps both statements:
        |
        |     BEGIN;
        |     INSERT INTO shelters ...;
        |     INSERT INTO users ...;
        |     COMMIT;              <- both saved together
        |
        | If anything inside throws, MySQL performs a ROLLBACK and the database
        | ends up exactly as it was. All of it, or none of it. This is
        | ATOMICITY - the "A" in the ACID properties.
        */
        $newUserId = DB::transaction(function () use ($validated, $email) {

            // ---- TABLE 1: the organisation ------------------------------
            DB::insert(
                "INSERT INTO shelters
                    (name, location, contact_email, contact_phone, status, created_at, updated_at)
                 VALUES
                    (?, ?, ?, ?, 'pending', NOW(), NOW())",
                [
                    $validated['shelterName'],
                    'Not specified',              // the signup form has no location field yet
                    $email,
                    $validated['shelterNumber'],
                ]
            );

            // The id MySQL just generated. We need it for the foreign key.
            $shelterId = DB::getPdo()->lastInsertId();

            // ---- TABLE 2: the person, linked to that shelter -------------
            //
            // The order is forced on us by the foreign key: the shelter must
            // exist before anything is allowed to point at it.
            DB::insert(
                "INSERT INTO users
                    (name, email, phone, shelter_id, shelter_name, shelter_contact,
                     password, role, created_at, updated_at)
                 VALUES
                    (?, ?, ?, ?, ?, ?, ?, 'shelter_staff', NOW(), NOW())",
                [
                    $validated['staffName'],
                    $email,
                    $validated['staffNumber'],
                    $shelterId,                    // <- the foreign key
                    $validated['shelterName'],     // legacy columns, kept in sync
                    $validated['shelterNumber'],   //    so older screens still work
                    Hash::make($validated['password']),
                ]
            );

            // Whatever this closure returns comes back out of DB::transaction().
            return DB::getPdo()->lastInsertId();
        });

        // Auto-login. This is AFTER the transaction committed - if the two
        // INSERTs had rolled back there would be no user to issue a token for.
        $token = User::find($newUserId)->createToken('petconnect-shelter_staff')->plainTextToken;

        /*
        | Read the finished result back with a JOIN, so the response shows the
        | staff member together with the shelter that was created alongside.
        */
        $user = DB::selectOne(
            "SELECT
                 users.id, users.name, users.email, users.phone,
                 users.role, users.shelter_id,
                 shelters.name          AS shelter_name,
                 shelters.contact_phone AS shelter_contact,
                 shelters.status        AS shelter_status
             FROM users
             JOIN shelters ON shelters.id = users.shelter_id
             WHERE users.id = ?",
            [$newUserId]
        );

        return response()->json([
            'message' => 'Shelter staff account created successfully.',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }
}
