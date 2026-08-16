<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Shelter;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ShelterRegisterController extends Controller
{
    /**
     * SHELTER STAFF SIGNUP  ->  POST /api/auth/shelter/register
     *
     * ONE form, TWO tables. Signing up creates:
     *     1. a row in `shelters` (the organisation)
     *     2. a row in `users`    (the person), pointing at it via shelter_id
     *
     * Previously signup only wrote the users row and kept the shelter name as
     * loose text, so shelters created here never showed up in the admin
     * dashboard's shelter list. Now both rows are created together.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'staffName' => ['required', 'regex:/^[A-Za-z\s]+$/'],

            // The shelter name now has to be unique in the SHELTERS table, not
            // just free text - two organisations cannot share a name.
            'shelterName' => ['required', 'regex:/^[A-Za-z\s]+$/', 'unique:shelters,name'],

            'shelterNumber' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'staffNumber' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],

            // Checked against BOTH tables: this address becomes the staff
            // login and the shelter's public contact, and both columns are UNIQUE.
            'email' => ['required', 'email', 'unique:users,email', 'unique:shelters,contact_email'],

            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        // Normalise once, then use the same value for both tables, so the two
        // rows can never disagree about the address.
        $email = strtolower($validated['email']);

        /*
        | WHY THIS MUST BE A TRANSACTION
        |
        | We are writing to two tables. Without a transaction this failure is
        | possible:
        |
        |     INSERT INTO shelters ... -> succeeds
        |     INSERT INTO users ...    -> fails (duplicate email, crash, disk full)
        |
        | which leaves a shelter in the database that nobody can log in to - a
        | row that should never have existed on its own.
        |
        | DB::transaction() wraps both statements in BEGIN ... COMMIT. If any
        | statement inside throws, MySQL performs a ROLLBACK and the database is
        | left exactly as it was. All of it, or none of it - this is ATOMICITY,
        | the "A" of the ACID properties.
        */
        $user = DB::transaction(function () use ($validated, $email) {

            // TABLE 1: the organisation.
            $shelter = Shelter::create([
                'name'          => $validated['shelterName'],
                'location'      => 'Not specified',  // the signup form has no location field yet
                'contact_email' => $email,
                'contact_phone' => $validated['shelterNumber'],

                // New shelters start as 'pending' so a platform admin approves
                // them before they go live - the same default the migration sets.
                'status'        => 'pending',
            ]);

            // TABLE 2: the person, linked to the row we just created.
            //
            // $shelter->id only exists because the INSERT above already ran and
            // MySQL handed back the AUTO_INCREMENT value. The foreign key forces
            // this ordering: the shelter must exist before anything may point at it.
            return User::create([
                'name'       => $validated['staffName'],
                'email'      => $email,
                'phone'      => $validated['staffNumber'],
                'shelter_id' => $shelter->id,   // <- the foreign key

                // Redundant copies of what `shelters` now stores. Kept in sync
                // only so older screens still reading these columns keep working;
                // they should be dropped once nothing reads them.
                'shelter_name'    => $validated['shelterName'],
                'shelter_contact' => $validated['shelterNumber'],

                // Hash::make() turns the plain password into a bcrypt hash.
                // (The model's 'password' => 'hashed' cast would do this anyway;
                // it detects an already-hashed value and leaves it alone, so
                // there is no double-hashing here.)
                'password' => Hash::make($validated['password']),
                'role'     => 'shelter_staff',
            ]);
        });

        // Auto-login: issue the API token now, so the new staff member lands
        // straight on their dashboard. Note this happens AFTER the transaction
        // has committed - if the two INSERTs had rolled back we would have no
        // user to issue a token for.
        $token = $user->createToken('petconnect-' . $user->role)->plainTextToken;

        return response()->json([
            'message' => 'Shelter staff account created successfully.',
            'token' => $token,
            // load() follows the foreign key back, so the response includes the
            // shelter row that was created alongside this user.
            'user' => $user->load('shelter'),
        ], 201);
    }
}
