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
| ADOPTER SIGNUP  ->  POST /api/auth/register
|==============================================================================
|
| One INSERT into the users table, written as raw SQL.
|
*/
class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'fullName' => ['required', 'regex:/^[A-Za-z\s]+$/'],
            'email'    => ['required', 'email'],
            'phone'    => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'address'  => ['required', 'string'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $email = strtolower($validated['email']);

        /*
        | Is this email already registered?
        |
        |     SELECT COUNT(*) FROM users WHERE email = ?;
        |
        | The users table has a UNIQUE index on email, so a duplicate is
        | impossible either way - but MySQL would throw a raw error. Checking
        | first lets us return a message the signup form can show.
        */
        $taken = DB::selectOne(
            "SELECT COUNT(*) AS total FROM users WHERE email = ?",
            [$email]
        );

        if ($taken->total > 0) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors'  => ['email' => ['This email is already registered.']],
            ], 422);
        }

        /*
        |     INSERT INTO users (...) VALUES (...);
        |
        | Hash::make() turns the password into a bcrypt hash. We must call it
        | ourselves - the model's automatic hashing does not apply to raw SQL.
        | Storing the plain password here would be the single worst bug you
        | could ship, so this line is worth double-checking.
        |
        | NOW() fills created_at and updated_at, which nothing does for us.
        */
        DB::insert(
            "INSERT INTO users
                (name, email, phone, address, password, role, created_at, updated_at)
             VALUES
                (?, ?, ?, ?, ?, 'adopter', NOW(), NOW())",
            [
                $validated['fullName'],
                $email,
                $validated['phone'],
                $validated['address'],
                Hash::make($validated['password']),
            ]
        );

        // The id MySQL just generated for the AUTO_INCREMENT column.
        $newId = DB::getPdo()->lastInsertId();

        /*
        | Auto-login: hand back a token so signup lands straight on the
        | dashboard. Token creation goes through the model because Sanctum
        | hashes tokens with its own scheme - see the note in AuthController.
        */
        $token = User::find($newId)->createToken('petconnect-adopter')->plainTextToken;

        $user = DB::selectOne(
            "SELECT id, name, email, phone, address, role, created_at
             FROM users WHERE id = ?",
            [$newId]
        );

        return response()->json([
            'message' => 'Adopter account created successfully.',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }
}
