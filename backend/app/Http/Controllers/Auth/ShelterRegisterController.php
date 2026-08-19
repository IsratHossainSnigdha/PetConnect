<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ShelterRegisterController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'staffName' => ['required', 'regex:/^[A-Za-z\s]+$/'],
            'shelterName' => ['required', 'regex:/^[A-Za-z\s]+$/'],
            'shelterNumber' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'staffNumber' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        $user = User::create([
            'name' => $validated['staffName'],
            'email' => strtolower($validated['email']),
            'phone' => $validated['staffNumber'],
            'shelter_name' => $validated['shelterName'],
            'shelter_contact' => $validated['shelterNumber'],
            'password' => Hash::make($validated['password']),
            'role' => 'shelter_staff',
        ]);

        return response()->json([
            'message' => 'Shelter staff account created successfully.',
            'user' => $user,
        ], 201);
    }
}