<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| AUTH CONTROLLER  -  logging in, and reading/updating your own row
|--------------------------------------------------------------------------
|
| HOW PASSWORDS ARE STORED (the most important security rule in a database)
|
| The `password` column NEVER holds the real password. It holds a one-way
| BCRYPT HASH:
|
|     "Password123!"  ->  "$2y$12$Ku8nP.../Xk9wQfa4mS"
|
| One-way means there is no un-hash function. Even with full access to the
| users table you cannot read anybody's password. That is the whole point:
| when a database leaks, the passwords must still be useless to the attacker.
|
| So logging in cannot be "SELECT * FROM users WHERE email=? AND password=?".
| Instead it is two steps:
|     1. SELECT the row by email
|     2. Hash::check() re-hashes what the user typed and compares the hashes
|
| The User model has `'password' => 'hashed'` in its casts(), so assigning a
| plain password automatically hashes it on the way into the database.
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

        // STEP 1: find the row.
        //     SELECT * FROM users WHERE email = ? LIMIT 1;
        //
        // This is fast because `email` carries a UNIQUE index (created back in
        // the original create_users_table migration). Without that index MySQL
        // would scan every user row on every single login attempt.
        $user = User::where('email', $credentials['email'])->first();

        // STEP 2: verify the password.
        //
        // Note we check BOTH conditions in one branch and return ONE generic
        // message. If we said "no account with that email" for a missing user
        // and "wrong password" for a bad password, an attacker could use the
        // difference to discover which emails are registered. That leak has a
        // name: USER ENUMERATION.
        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            // Throwing a ValidationException produces a normal 422 response,
            // shaped exactly like every other validation error the frontend
            // already knows how to display.
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        // STEP 3: issue an API token (Laravel Sanctum).
        //
        // createToken() INSERTs a row into the `personal_access_tokens` table -
        // that table came from the migration that already existed in this
        // project. Only a HASH of the token is stored there, for the same
        // reason passwords are hashed.
        //
        // The plain text token is returned exactly once, here. The React app
        // saves it and sends it back on later requests as
        //     Authorization: Bearer <token>
        // which is how the server knows who is calling.
        $token = $user->createToken('petconnect-' . $user->role)->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'token'   => $token,
            'user'    => $user,   // `password` is never included - see #[Hidden] on the model
        ]);
    }

    /**
     * CURRENT USER  ->  GET /api/auth/me
     *
     * Reachable only through the auth:sanctum middleware, which reads the
     * Bearer token, looks it up in personal_access_tokens, and loads the
     * matching user row. $request->user() is that row.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        // If this user is shelter staff, pull in their shelter through the
        // foreign key relationship as well.
        $user->load('shelter');

        return response()->json([
            'message' => 'Authenticated user fetched.',
            'user'    => $user,
        ]);
    }

    /**
     * UPDATE OWN PROFILE  ->  PUT /api/auth/profile
     *
     * Runs: UPDATE users SET name=?, username=?, ... WHERE id = <me>;
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'     => ['required', 'regex:/^[A-Za-z\s.\'-]+$/', 'max:255'],

            // nullable = the column accepts NULL, so an empty value is allowed.
            // ignore($user->id) stops the rule from complaining that this
            // username is taken by... this very user.
            'username' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email'    => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone'    => ['nullable', 'regex:/^(?:\+88|01)?\d{11}$/'],

            // The UI calls this "Location"; the column has always been `address`.
            // We map it below rather than renaming the column, because renaming
            // a column that other code already reads is a breaking change.
            'address'  => ['nullable', 'string', 'max:255'],
        ]);

        // IMPORTANT: `role` is deliberately NOT in the validated list above.
        // If it were, any logged-in adopter could POST {"role":"platform_admin"}
        // and promote themselves. Never let a user edit their own permission
        // column - this is called PRIVILEGE ESCALATION.
        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * CHANGE PASSWORD  ->  PUT /api/auth/password
     *
     * Runs: UPDATE users SET password = <new hash>, password_changed_at = NOW()
     *       WHERE id = <me>;
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            // WHY ASK FOR THE CURRENT PASSWORD AT ALL?
            // The user is already logged in, so this is not about identifying
            // them. It defends against a STOLEN SESSION: if somebody walks up to
            // an unlocked laptop, or steals the token, they still cannot lock the
            // real owner out of the account without knowing the old password.
            'current_password' => ['required', 'string'],

            'password' => [
                'required',
                'confirmed',   // requires a matching `password_confirmation` field
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        // Compare the submitted current password against the stored bcrypt hash.
        // The real password is not in the database, so this is a re-hash and
        // compare - never a plain string equality check.
        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Your current password is incorrect.'],
            ]);
        }

        // Reject "changing" the password to the same value. Without this the
        // request would succeed and password_changed_at would move, wrongly
        // suggesting the credential had been rotated.
        if (Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The new password must be different from your current one.'],
            ]);
        }

        // Two writes in one statement. The model's 'password' => 'hashed' cast
        // bcrypts the value on the way into the column, so the plain text is
        // never stored.
        $user->update([
            'password'            => $validated['password'],
            'password_changed_at' => now(),
        ]);

        /*
        | REVOKE EVERY OTHER SESSION.
        |
        | Changing a password is what you do when you think somebody else has
        | access. That only helps if their existing tokens stop working - so we
        | DELETE every token row for this user EXCEPT the one making this
        | request (otherwise you would log yourself out mid-action).
        |
        |     DELETE FROM personal_access_tokens
        |     WHERE tokenable_id = ? AND id <> <current token id>;
        */
        $currentTokenId = $request->user()->currentAccessToken()->id;

        $revoked = $user->tokens()
            ->where('id', '!=', $currentTokenId)
            ->delete();   // returns how many rows were deleted

        return response()->json([
            'message'          => 'Password changed successfully.',
            'revoked_sessions' => $revoked,
            'user'             => $user->fresh(),
        ]);
    }

    /**
     * LOGOUT  ->  POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        // DELETE FROM personal_access_tokens WHERE id = <the token used now>;
        //
        // Deleting the row is what actually makes the token stop working. Simply
        // dropping it from the browser's localStorage would leave a valid token
        // alive in the database until it expired.
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}
