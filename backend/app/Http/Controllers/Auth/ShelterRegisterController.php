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
| SHELTER STAFF SIGNUP   ->   POST /api/auth/staff/register
|==============================================================================
|
| Handles registration for staff members joining an existing shelter via shelter_id.
|
*/
class ShelterRegisterController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'staffName'   => ['required', 'regex:/^[A-Za-z\s]+$/'],
            'shelter_id'  => ['required', 'exists:shelters,id'],
            'staffNumber' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'email'       => ['required', 'email', 'unique:users,email'],
            'password'    => [
                'required',
                'confirmed',
                Password::min(8)->mixedCase()->numbers()->symbols(),
            ],
        ]);

        $user = User::create([
            'name'        => $validated['staffName'],
            'email'       => strtolower($validated['email']),
            'phone'       => $validated['staffNumber'],
            'shelter_id'  => $validated['shelter_id'],
            'password'    => Hash::make($validated['password']),
            'role'        => 'shelter_staff',
        ]);

        $token = $user->createToken('petconnect-shelter_staff')->plainTextToken;

        // Load user with shelter details via JOIN
        $userData = DB::selectOne(
            "SELECT users.id, users.name, users.email, users.phone, users.role, users.shelter_id,
                    shelters.name AS shelter_name, shelters.contact_phone AS shelter_contact, shelters.status AS shelter_status
             FROM users
             JOIN shelters ON shelters.id = users.shelter_id
             WHERE users.id = ?",
            [$user->id]
        );

        return response()->json([
            'message' => 'Shelter staff account created successfully.',
            'token'   => $token,
            'user'    => $userData,
        ], 201);
    }
}