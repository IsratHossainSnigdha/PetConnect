<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/*
|==============================================================================
| ADMIN SIGNUP  ->  POST /api/auth/admin/register
|==============================================================================
|
| Same single INSERT as the adopter signup, with one extra gate: you must know
| the admin secret key, which lives in the .env file as ADMIN_SECRET_KEY.
|
*/
class AdminRegisterController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => ['required', 'regex:/^[A-Za-z\s.\'-]+$/'],
            'number'   => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'email'    => ['required', 'email'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
            'adminKey' => ['required'],
        ]);

        // The gate. Nothing touches the database until this passes.
        if ($validated['adminKey'] !== Config::get('app.admin_secret_key')) {
            return response()->json([
                'message' => 'Invalid admin secret key.',
            ], 403);
        }

        $email = strtolower($validated['email']);

        // Is this email already registered?
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
        | INSERT the new admin.
        |
        | Note the role is written as a literal 'platform_admin' inside the SQL
        | rather than taken from the request. If it came from the request, a
        | user could choose their own role - which is the whole point of having
        | a role column in the first place.
        */
        DB::insert(
            "INSERT INTO users
                (name, email, phone, password, role, created_at, updated_at)
             VALUES
                (?, ?, ?, ?, 'platform_admin', NOW(), NOW())",
            [
                $validated['name'],
                $email,
                $validated['number'],
                Hash::make($validated['password']),
            ]
        );

        $newId = DB::getPdo()->lastInsertId();

        // Auto-login (token creation goes through the model - see AuthController).
        $token = User::find($newId)->createToken('petconnect-platform_admin')->plainTextToken;

        $user = DB::selectOne(
            "SELECT id, name, email, phone, role, created_at
             FROM users WHERE id = ?",
            [$newId]
        );

        return response()->json([
            'message' => 'Platform admin registered successfully.',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }
}
