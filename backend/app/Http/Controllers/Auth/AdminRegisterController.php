<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Validation\Rules\Password;

class AdminRegisterController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'regex:/^[A-Za-z\s.\'-]+$/'],
            'number' => ['required', 'regex:/^(?:\+88|01)?\d{11}$/'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
            'adminKey' => ['required']
        ]);

        if ($validated['adminKey'] !== Config::get('app.admin_secret_key')) {
            return response()->json([
                'message' => 'Invalid admin secret key.'
            ], 403);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['number'],
            'password' => $validated['password'],
            'role' => 'platform_admin',
        ]);

        return response()->json([
            'message' => 'Platform admin registered successfully.',
            'user' => $user
        ], 201);
    }
}