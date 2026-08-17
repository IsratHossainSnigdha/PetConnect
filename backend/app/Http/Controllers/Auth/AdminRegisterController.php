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

        /*
        | AUTO-LOGIN AFTER SIGNUP
        |
        | Creating the users row proves who this person is just as well as a
        | login would - they chose the password seconds ago. So instead of
        | making them type it straight back in, we issue the token here.
        |
        | createToken() INSERTs a row into `personal_access_tokens` (only a
        | HASH of the token is stored). The plain token is returned exactly
        | once, right here, and the browser saves it - identical to what
        | AuthController@login does.
        */
        $token = $user->createToken('petconnect-' . $user->role)->plainTextToken;

        return response()->json([
            'message' => 'Platform admin registered successfully.',
            'token' => $token,
            'user' => $user
        ], 201);
    }
}