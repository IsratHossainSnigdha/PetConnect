<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'fullName' => ['required','regex:/^[A-Za-z\s]+$/'],
            'email' => ['required','email','unique:users,email'],
            'phone' => ['required','regex:/^(?:\+88|01)?\d{11}$/'],
            'address' => ['required','string'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ]
        ]);

        $user = User::create([
            'name' => $validated['fullName'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'address' => $validated['address'],
            'password' => $validated['password'],
            'role' => 'adopter'
        ]);

        // Auto-login: issue the API token now, so the adopter lands straight on
        // their dashboard instead of being asked for the password they just
        // chose. See AdminRegisterController for the full explanation.
        $token = $user->createToken('petconnect-' . $user->role)->plainTextToken;

        return response()->json([
            'message' => 'Adopter account created successfully.',
            'token' => $token,
            'user' => $user
        ],201);
    }
}