<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/*
|==============================================================================
| AUTH CONTROLLER  -  logging in, and reading/updating your own row
|==============================================================================
|
| The queries in this file are written as raw SQL.
|
| HOW PASSWORDS ARE STORED (the most important rule in this whole project)
|
| The `password` column NEVER holds the real password. It holds a one-way
| BCRYPT HASH:
|
|     "Password123!"  ->  "$2y$12$Ku8nP.../Xk9wQfa4mS"
|
| One-way means there is no un-hash function. Even with full access to the
| users table you cannot read anybody's password. That is the point: when a
| database leaks, the passwords must still be useless to whoever took it.
|
| So logging in CANNOT be:
|
|     SELECT * FROM users WHERE email = ? AND password = ?   <- impossible
|
| It has to be two steps:
|     1. SELECT the row by email
|     2. Hash::check() re-hashes what was typed and compares the two hashes
|
|------------------------------------------------------------------------------
| ONE PLACE WE STILL USE THE MODEL, ON PURPOSE
|------------------------------------------------------------------------------
|
| API tokens are handled by Laravel Sanctum, which hashes each token with its
| own secret scheme before storing it in `personal_access_tokens`. Writing
| those rows by hand with INSERT would mean copying that scheme exactly, and
| any small mistake would silently break login for EVERY member of the team -
| the whole app sits behind auth:sanctum.
|
| So token creation and deletion still go through the model. Everything that
| is ordinary data - looking a user up, editing a profile, changing a password
| - is raw SQL below.
|
*/
class AuthController extends Controller
{
    /**
     * LOGIN  ->  POST /api/auth/login
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        /*
        | STEP 1: find the row.
        |
        |     SELECT * FROM users WHERE email = ? LIMIT 1;
        |
        | LIMIT 1 tells MySQL it can stop as soon as it finds a match instead
        | of scanning the rest of the table. This lookup is fast because
        | `email` has a UNIQUE index on it - without one, MySQL would read
        | every user row on every single login attempt.
        */
        $row = DB::selectOne(
            "SELECT id, name, email, password, role
             FROM users
             WHERE email = ?
             LIMIT 1",
            [$credentials['email']]
        );

        /*
        | STEP 2: verify the password.
        |
        | Both failures are checked together and answered with ONE generic
        | message. Saying "no account with that email" for a missing user but
        | "wrong password" for a bad password would let someone use this form
        | to discover which email addresses are registered. That leak has a
        | name: USER ENUMERATION.
        */
        if (! $row || ! Hash::check($credentials['password'], $row->password)) {
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        // STEP 3: issue the API token (see the note at the top of this file
        // for why this one step is not raw SQL).
        $user  = User::find($row->id);
        $token = $user->createToken('petconnect-' . $row->role)->plainTextToken;

        // Fetch the full row to return, without the password hash in it.
        $safeUser = DB::selectOne(
            "SELECT id, name, username, email, phone, address, role,
                    shelter_id, created_at, updated_at
             FROM users WHERE id = ?",
            [$row->id]
        );

        return response()->json([
            'message' => 'Logged in successfully.',
            'token'   => $token,
            'user'    => $safeUser,
        ]);
    }

    /**
     * CURRENT USER  ->  GET /api/auth/me
     *
     * Reachable only through the auth:sanctum middleware, which reads the
     * Bearer token, looks it up in personal_access_tokens, and works out who
     * is calling. We then read that user's row ourselves.
     */
    public function me(Request $request)
    {
        $id = $request->user()->id;

        /*
        | A LEFT JOIN so shelter staff also get their shelter's details.
        |
        | It must be LEFT, not a plain JOIN. Adopters and admins have
        | shelter_id = NULL, and an inner JOIN would return no row at all for
        | them - they would appear to not exist.
        |
        | "AS" renames the shelter columns because both tables have a column
        | called `name`; without renaming they would collide in the result.
        */
        $user = DB::selectOne(
            "SELECT
                 users.id, users.name, users.username, users.email,
                 users.phone, users.address, users.role, users.shelter_id,
                 users.password_changed_at, users.created_at, users.updated_at,
                 shelters.name     AS shelter_name,
                 shelters.location AS shelter_location
             FROM users
             LEFT JOIN shelters ON shelters.id = users.shelter_id
             WHERE users.id = ?",
            [$id]
        );

        return response()->json([
            'message' => 'Authenticated user fetched.',
            'user'    => $user,
        ]);
    }

    /**
     * UPDATE OWN PROFILE  ->  PUT /api/auth/profile
     */
    public function updateProfile(Request $request)
    {
        $id = $request->user()->id;

        $validated = $request->validate([
            'name'     => ['required', 'regex:/^[A-Za-z\s.\'-]+$/', 'max:255'],
            'username' => ['nullable', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255'],
            'phone'    => ['nullable', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'address'  => ['nullable', 'string', 'max:255'],
        ]);

        /*
        | Is this email or username already used by SOMEBODY ELSE?
        |
        | "AND id <> ?" is what makes this work. Without it the query would
        | match your own row and tell you your own email is taken, so editing
        | just your phone number would fail.
        */
        $clash = DB::selectOne(
            "SELECT
                 SUM(email = ?)    AS email_taken,
                 SUM(username = ?) AS username_taken
             FROM users
             WHERE id <> ?",
            [$validated['email'], $validated['username'] ?? null, $id]
        );

        $errors = [];
        if ($clash->email_taken > 0)    { $errors['email'] = ['The email has already been taken.']; }
        if ($clash->username_taken > 0) { $errors['username'] = ['The username has already been taken.']; }

        if ($errors) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors'  => $errors,
            ], 422);
        }

        /*
        |     UPDATE users SET ... WHERE id = ?;
        |
        | Notice `role` is NOT in this list, deliberately. If it were, any
        | logged-in adopter could send {"role":"platform_admin"} and promote
        | themselves. Never let a user edit their own permission column - that
        | is called PRIVILEGE ESCALATION.
        |
        | The id comes from the TOKEN, never from the request body, so nobody
        | can edit somebody else's row by changing a number.
        */
        DB::update(
            "UPDATE users SET
                 name       = ?,
                 username   = ?,
                 email      = ?,
                 phone      = ?,
                 address    = ?,
                 updated_at = NOW()
             WHERE id = ?",
            [
                $validated['name'],
                $validated['username'] ?? null,
                $validated['email'],
                $validated['phone']    ?? null,
                $validated['address']  ?? null,
                $id,
            ]
        );

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => DB::selectOne(
                "SELECT id, name, username, email, phone, address, role,
                        shelter_id, password_changed_at, created_at, updated_at
                 FROM users WHERE id = ?",
                [$id]
            ),
        ]);
    }

    /**
     * CHANGE PASSWORD  ->  PUT /api/auth/password
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();
        $id   = $user->id;

        $validated = $request->validate([
            // Asking for the current password is not about identifying you -
            // you are already logged in. It stops somebody who walked up to an
            // unlocked laptop from locking the real owner out of the account.
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', 'min:8'],
        ]);

        // Read the stored hash so we can compare against it.
        $row = DB::selectOne("SELECT password FROM users WHERE id = ?", [$id]);

        if (! Hash::check($validated['current_password'], $row->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Your current password is incorrect.'],
            ]);
        }

        // Refuse a "change" to the same password - otherwise the timestamp
        // would move and wrongly suggest the credential had been rotated.
        if (Hash::check($validated['password'], $row->password)) {
            throw ValidationException::withMessages([
                'password' => ['The new password must be different from your current one.'],
            ]);
        }

        /*
        | Hash::make() turns the plain password into a bcrypt hash. We must do
        | this ourselves here: the model's automatic hashing does not apply to
        | a raw SQL UPDATE.
        |
        | Getting this wrong would store the password in plain text, so it is
        | the one line in this file worth double-checking.
        */
        DB::update(
            "UPDATE users
             SET password = ?, password_changed_at = NOW(), updated_at = NOW()
             WHERE id = ?",
            [Hash::make($validated['password']), $id]
        );

        /*
        | REVOKE EVERY OTHER SESSION.
        |
        | You change a password when you think somebody else has access. That
        | only helps if their existing tokens stop working. We delete every
        | token row for this user EXCEPT the one making this request, so you
        | are not logged out mid-action.
        |
        | This is raw SQL because it is an ordinary DELETE - no token hashing
        | is involved in removing rows.
        |
        |     DELETE FROM personal_access_tokens
        |     WHERE tokenable_id = ? AND id <> ?;
        */
        $currentTokenId = $user->currentAccessToken()->id;

        $revoked = DB::delete(
            "DELETE FROM personal_access_tokens
             WHERE tokenable_id = ?
               AND tokenable_type = ?
               AND id <> ?",
            [$id, User::class, $currentTokenId]
        );

        return response()->json([
            'message'          => 'Password changed successfully.',
            'revoked_sessions' => $revoked,
            'user'             => DB::selectOne(
                "SELECT id, name, email, role, password_changed_at
                 FROM users WHERE id = ?",
                [$id]
            ),
        ]);
    }

    /**
     * LOGOUT  ->  POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        /*
        |     DELETE FROM personal_access_tokens WHERE id = ?;
        |
        | Deleting the row is what actually makes the token stop working.
        | Merely dropping it from the browser would leave a valid token alive
        | in the database until it expired.
        */
        $tokenId = $request->user()->currentAccessToken()->id;

        DB::delete("DELETE FROM personal_access_tokens WHERE id = ?", [$tokenId]);

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
