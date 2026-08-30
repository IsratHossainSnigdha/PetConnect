<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        
        $userData = DB::selectOne("SELECT * FROM users WHERE id = ?", [$user->id]);

        return response()->json($userData);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        
        $dataToUpdate = $request->all();
        
        if (empty($dataToUpdate)) {
            $updatedUser = DB::selectOne("SELECT * FROM users WHERE id = ?", [$user->id]);
            return response()->json([
                'message' => 'Profile updated successfully',
                'data' => $updatedUser
            ]);
        }

      
        if (isset($dataToUpdate['password'])) {
            $dataToUpdate['password'] = bcrypt($dataToUpdate['password']);
        }
        
        $dataToUpdate['updated_at'] = now();

      
        DB::table('users')->where('id', $user->id)->update($dataToUpdate);

        
        $updatedUser = DB::selectOne("SELECT * FROM users WHERE id = ?", [$user->id]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => $updatedUser
        ]);
    }
}