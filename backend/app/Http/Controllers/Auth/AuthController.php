<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * LOGIN
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | Validate login input
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Find user by email
        |--------------------------------------------------------------------------
        */

        $row = DB::selectOne(
            "SELECT
                id,
                name,
                email,
                password,
                role,
                shelter_id
             FROM users
             WHERE email = ?
             LIMIT 1",
            [$validated['email']]
        );

        /*
        |--------------------------------------------------------------------------
        | Check password
        |--------------------------------------------------------------------------
        */

        if (!$row || !Hash::check($validated['password'], $row->password)) {
            throw ValidationException::withMessages([
                'email' => [
                    'These credentials do not match our records.'
                ],
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Find Eloquent user
        |--------------------------------------------------------------------------
        |
        | Sanctum token creation must use the User model.
        |
        */

        $user = User::find($row->id);

        if (!$user) {
            return response()->json([
                'message' => 'User account could not be found.'
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Create Sanctum token
        |--------------------------------------------------------------------------
        */

        $token = $user
            ->createToken('petconnect-' . $row->role)
            ->plainTextToken;

        /*
        |--------------------------------------------------------------------------
        | Get safe user information
        |--------------------------------------------------------------------------
        |
        | NEVER return the password hash.
        |
        */

        $safeUser = DB::selectOne(
            "SELECT
                id,
                name,
                username,
                email,
                phone,
                address,
                role,
                shelter_id,
                created_at,
                updated_at
             FROM users
             WHERE id = ?",
            [$row->id]
        );

        /*
        |--------------------------------------------------------------------------
        | Return login response
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' => 'Logged in successfully.',
            'token' => $token,
            'user' => $safeUser,
        ], 200);
    }


    /**
     * REGISTER SHELTER STAFF
     * POST /api/auth/staff/register
     */
    public function registerStaff(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email'
            ],

            'password' => [
                'required',
                'string',
                'min:6'
            ],

            'shelter_id' => [
                'required',
                'exists:shelters,id'
            ],

            'phone' => [
                'nullable',
                'string',
                'max:255'
            ],
        ], [
            'shelter_id.exists' =>
                'The selected shelter does not exist in our database. Please select a valid shelter.',

            'shelter_id.required' =>
                'A shelter must be selected for shelter staff accounts.',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Create staff user
        |--------------------------------------------------------------------------
        */

        $newUserId = DB::transaction(function () use ($validated) {

            DB::insert(
                "INSERT INTO users
                    (
                        name,
                        email,
                        password,
                        role,
                        shelter_id,
                        created_at,
                        updated_at
                    )
                 VALUES
                    (?, ?, ?, 'shelter_staff', ?, NOW(), NOW())",
                [
                    $validated['name'],
                    $validated['email'],
                    Hash::make($validated['password']),
                    $validated['shelter_id'],
                ]
            );

            return DB::getPdo()->lastInsertId();
        });

        /*
        |--------------------------------------------------------------------------
        | Create token
        |--------------------------------------------------------------------------
        */

        $user = User::find($newUserId);

        $token = $user
            ->createToken('petconnect-shelter_staff')
            ->plainTextToken;

        /*
        |--------------------------------------------------------------------------
        | Get staff + shelter information
        |--------------------------------------------------------------------------
        */

        $safeUser = DB::selectOne(
            "SELECT
                users.id,
                users.name,
                users.email,
                users.role,
                users.shelter_id,
                shelters.name AS shelter_name,
                shelters.status AS shelter_status
             FROM users
             LEFT JOIN shelters
                ON shelters.id = users.shelter_id
             WHERE users.id = ?",
            [$newUserId]
        );

        return response()->json([
            'message' => 'Shelter staff account created successfully.',
            'token' => $token,
            'user' => $safeUser,
        ], 201);
    }


    /**
     * CURRENT USER
     * GET /api/auth/me
     */
    public function me(Request $request)
    {
        $id = $request->user()->id;

        $user = DB::selectOne(
            "SELECT
                users.id,
                users.name,
                users.username,
                users.email,
                users.phone,
                users.address,
                users.role,
                users.shelter_id,
                users.password_changed_at,
                users.created_at,
                users.updated_at,

                shelters.name AS shelter_name,
                shelters.location AS shelter_location

             FROM users

             LEFT JOIN shelters
                ON shelters.id = users.shelter_id

             WHERE users.id = ?",
            [$id]
        );

        return response()->json([
            'message' => 'Authenticated user fetched.',
            'user' => $user,
        ], 200);
    }


    /**
     * UPDATE OWN PROFILE
     * PUT /api/auth/profile
     */
    public function updateProfile(Request $request)
    {
        $id = $request->user()->id;

        $validated = $request->validate([
            'name' => [
                'required',
                'regex:/^[A-Za-z\s.\'-]+$/',
                'max:255'
            ],

            'username' => [
                'nullable',
                'string',
                'max:255'
            ],

            'email' => [
                'required',
                'email',
                'max:255'
            ],

            'phone' => [
                'nullable',
                'regex:/^(?:\+8801)?\d{11}$/'
            ],

            'address' => [
                'nullable',
                'string',
                'max:255'
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Check duplicate email / username
        |--------------------------------------------------------------------------
        */

        $clash = DB::selectOne(
            "SELECT
                SUM(email = ?) AS email_taken,
                SUM(username = ?) AS username_taken
             FROM users
             WHERE id <> ?",
            [
                $validated['email'],
                $validated['username'] ?? null,
                $id
            ]
        );

        $errors = [];

        if ($clash->email_taken > 0) {
            $errors['email'] = [
                'The email has already been taken.'
            ];
        }

        if ($clash->username_taken > 0) {
            $errors['username'] = [
                'The username has already been taken.'
            ];
        }

        if (!empty($errors)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $errors,
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Update profile
        |--------------------------------------------------------------------------
        */

        DB::update(
            "UPDATE users
             SET
                name = ?,
                username = ?,
                email = ?,
                phone = ?,
                address = ?,
                updated_at = NOW()
             WHERE id = ?",
            [
                $validated['name'],
                $validated['username'] ?? null,
                $validated['email'],
                $validated['phone'] ?? null,
                $validated['address'] ?? null,
                $id,
            ]
        );

        return response()->json([
            'message' => 'Profile updated successfully.',

            'user' => DB::selectOne(
                "SELECT
                    id,
                    name,
                    username,
                    email,
                    phone,
                    address,
                    role,
                    shelter_id,
                    password_changed_at,
                    created_at,
                    updated_at
                 FROM users
                 WHERE id = ?",
                [$id]
            ),
        ], 200);
    }


    /**
     * CHANGE PASSWORD
     * PUT /api/auth/password
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();
        $id = $user->id;

        $validated = $request->validate([
            'current_password' => [
                'required',
                'string'
            ],

            'password' => [
                'required',
                'confirmed',
                'min:8'
            ],
        ]);

        $row = DB::selectOne(
            "SELECT password
             FROM users
             WHERE id = ?",
            [$id]
        );

        if (!$row || !Hash::check(
            $validated['current_password'],
            $row->password
        )) {
            throw ValidationException::withMessages([
                'current_password' => [
                    'Your current password is incorrect.'
                ],
            ]);
        }

        if (Hash::check(
            $validated['password'],
            $row->password
        )) {
            throw ValidationException::withMessages([
                'password' => [
                    'The new password must be different from your current one.'
                ],
            ]);
        }

        DB::update(
            "UPDATE users
             SET
                password = ?,
                password_changed_at = NOW(),
                updated_at = NOW()
             WHERE id = ?",
            [
                Hash::make($validated['password']),
                $id
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Revoke all other tokens
        |--------------------------------------------------------------------------
        */

        $currentToken = $user->currentAccessToken();

        if ($currentToken) {
            DB::delete(
                "DELETE FROM personal_access_tokens
                 WHERE tokenable_id = ?
                   AND tokenable_type = ?
                   AND id <> ?",
                [
                    $id,
                    User::class,
                    $currentToken->id
                ]
            );
        }

        return response()->json([
            'message' => 'Password changed successfully.',
            'revoked_sessions' => $currentToken ? 1 : 0,

            'user' => DB::selectOne(
                "SELECT
                    id,
                    name,
                    email,
                    role,
                    password_changed_at
                 FROM users
                 WHERE id = ?",
                [$id]
            ),
        ], 200);
    }


    /**
     * LOGOUT
     * POST /api/auth/logout
     */
    public function logout(Request $request)
    {
        $currentToken = $request->user()->currentAccessToken();

        if ($currentToken) {
            DB::delete(
                "DELETE FROM personal_access_tokens
                 WHERE id = ?",
                [$currentToken->id]
            );
        }

        return response()->json([
            'message' => 'Logged out successfully.'
        ], 200);
    }
}