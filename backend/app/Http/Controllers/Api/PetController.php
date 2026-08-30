<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PetController extends Controller
{
    public function index()
    {
        
        $pets = DB::select("SELECT * FROM pets");
        return response()->json($pets);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'breed' => 'nullable|string|max:255',
            'age' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'image' => 'nullable|string',
            'shelter_id' => 'nullable|exists:shelters,id',
        ]);

        if (!isset($validated['shelter_id'])) {
            $user = $request->user();
            if ($user && method_exists($user, 'shelter') && $user->shelter) {
                $validated['shelter_id'] = $user->shelter->id;
            } else {
                $validated['shelter_id'] = 1; 
            }
        }

       
        $petId = DB::table('pets')->insertGetId([
            'name' => $validated['name'],
            'type' => $validated['type'],
            'breed' => $validated['breed'] ?? null,
            'age' => $validated['age'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'],
            'image' => $validated['image'] ?? null,
            'shelter_id' => $validated['shelter_id'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        
        $pet = DB::selectOne("SELECT * FROM pets WHERE id = ?", [$petId]);

        return response()->json([
            'message' => 'Pet added successfully!',
            'pet' => $pet
        ], 201);
    }

    public function update(Request $request, $id)
    {
       
        $pet = DB::selectOne("SELECT * FROM pets WHERE id = ?", [$id]);

        if (!$pet) {
            return response()->json(['message' => 'Pet not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string',
            'breed' => 'nullable|string|max:255',
            'age' => 'nullable|string|max:255',
            'gender' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|string',
            'image' => 'nullable|string',
        ]);

        
        $updateData = $validated;
        $updateData['updated_at'] = now();

        DB::table('pets')->where('id', $id)->update($updateData);

       
        $updatedPet = DB::selectOne("SELECT * FROM pets WHERE id = ?", [$id]);

        return response()->json([
            'message' => 'Pet updated successfully!',
            'pet' => $updatedPet
        ], 200);
    }

    public function destroy($id)
    {
        $pet = DB::selectOne("SELECT * FROM pets WHERE id = ?", [$id]);

        if (!$pet) {
            return response()->json(['message' => 'Pet not found'], 404);
        }

       
        DB::delete("DELETE FROM pets WHERE id = ?", [$id]);

        return response()->json([
            'message' => 'Pet deleted successfully!'
        ], 200);
    }
}