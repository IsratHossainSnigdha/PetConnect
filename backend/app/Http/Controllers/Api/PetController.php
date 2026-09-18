<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Pet; // Ensure the Pet model is imported

class PetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // If the user is shelter_staff, filter pets by their assigned shelter_id
        if ($user && $user->role === 'shelter_staff') {
            if (!$user->shelter_id) {
                return response()->json([
                    'message' => 'Your account is not assigned to any shelter.',
                    'pets'    => [],
                ], 403);
            }

            $pets = DB::select(
                "SELECT * FROM pets WHERE shelter_id = ? ORDER BY created_at DESC",
                [$user->shelter_id]
            );
        } else {
            // Admin or other roles can view all pets
            $pets = DB::select("SELECT * FROM pets ORDER BY created_at DESC");
        }

        return response()->json($pets);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'breed' => 'nullable|string',
            'age' => 'nullable|string',
            'status' => 'required|string',
            'image' => 'nullable|string',
        ]);

        $user = auth()->user();

        if (!$user || !$user->shelter_id) {
            return response()->json(['message' => 'Shelter not found.'], 422);
        }

        try {
            // Stored procedure diye pet add korchi
            DB::statement('CALL sp_add_shelter_pet(?, ?, ?, ?, ?, ?, ?)', [
                $request->name,
                $request->type,
                $request->breed,
                $request->age,
                $request->status,
                $request->image,
                $user->shelter_id,
            ]);

            $pet = Pet::where('shelter_id', $user->shelter_id)->latest()->first();

            return response()->json([
                'message' => 'Pet added successfully!',
                'pet' => $pet
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to add pet.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeWithMedicalRecord(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'status' => 'required|string',
            'shelter_id' => 'required|exists:shelters,id',
        ]);

        $user = $request->user();
        $shelterId = ($user && $user->role === 'shelter_staff') ? $user->shelter_id : $request->shelter_id;

        try {
            // Transaction use kore pet ebong medical record ekoi sathe save korchi
            $petId = DB::transaction(function () use ($request, $shelterId) {
                
                $newPetId = DB::table('pets')->insertGetId([
                    'name' => $request->name,
                    'type' => $request->type,
                    'breed' => $request->breed,
                    'age' => $request->age,
                    'gender' => $request->gender,
                    'description' => $request->description,
                    'status' => $request->status,
                    'image' => $request->image,
                    'shelter_id' => $shelterId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('medical_records')->insert([
                    'pet_id' => $newPetId,
                    'vaccination_status' => $request->vaccination_status ?? 'Pending',
                    'notes' => $request->medical_notes ?? 'Initial record',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return $newPetId;
            });

            $pet = DB::selectOne("SELECT * FROM pets WHERE id = ?", [$petId]);
            $medicalRecord = DB::selectOne("SELECT * FROM medical_records WHERE pet_id = ?", [$petId]);

            return response()->json([
                'message' => 'Pet and medical record saved successfully!',
                'pet' => $pet,
                'medical_record' => $medicalRecord
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Transaction failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getShelterPetSummary(Request $request)
    {
        $user = $request->user();

        // Ensure the user is shelter_staff and has an assigned shelter
        if (!$user || $user->role !== 'shelter_staff') {
            return response()->json([
                'message' => 'Unauthorized access. Only shelter staff can view this summary.'
            ], 403);
        }

        if (!$user->shelter_id) {
            return response()->json([
                'message' => 'Your account is not assigned to any shelter.',
                'summary' => []
            ], 403);
        }

        // 1. Retrieve pets belonging ONLY to the authenticated staff member's shelter
        $pets = DB::select(
            "SELECT * FROM pets WHERE shelter_id = ?",
            [$user->shelter_id]
        );

        // Initialize summary counters and category lists
        $totalPets = count($pets);
        $availableCount = 0;
        $pendingCount = 0;
        $adoptedCount = 0;
        
        $availablePets = [];
        $pendingPets = [];
        $adoptedPets = [];

        // 2. Loop through each shelter pet to check and categorize their status
        foreach ($pets as $pet) {
            // Normalize status to lowercase for reliable comparison
            $status = strtolower($pet->status ?? 'available');

            if ($status === 'available') {
                $availableCount++;
                $availablePets[] = $pet;
            } elseif ($status === 'pending') {
                $pendingCount++;
                $pendingPets[] = $pet;
            } elseif ($status === 'adopted') {
                $adoptedCount++;
                $adoptedPets[] = $pet;
            }
        }

        // 3. Generate the final summary of the shelter's pet statuses
        return response()->json([
            'message' => 'Shelter pet status summary generated successfully.',
            'shelter_id' => $user->shelter_id,
            'total_pets' => $totalPets,
            'summary_counts' => [
                'available' => $availableCount,
                'pending' => $pendingCount,
                'adopted' => $adoptedCount,
            ],
            'categorized_pets' => [
                'available' => $availablePets,
                'pending' => $pendingPets,
                'adopted' => $adoptedPets,
            ]
        ], 200);
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        
        // Ensure user is staff and has a shelter assigned
        if (!$user || ($user->role === 'shelter_staff' && !$user->shelter_id)) {
            return response()->json([
                'message' => 'Your account is not assigned to any shelter.',
                'stats' => [],
                'pets' => []
            ], 403);
        }

        $shelterId = $user->shelter_id; // Staff ba Shelter ID

        // Shudhu ei shelter-er pet gulai ana hobe
        $pets = Pet::where('shelter_id', $shelterId)->latest()->get();

        // Stats o ei shelter-er upor base kore count korbe
        $stats = [
            'total' => Pet::where('shelter_id', $shelterId)->count(),
            'available' => Pet::where('shelter_id', $shelterId)->where('status', 'Available')->count(),
            'pending' => Pet::where('shelter_id', $shelterId)->where('status', 'Pending')->count(),
            'adopted' => Pet::where('shelter_id', $shelterId)->where('status', 'Adopted')->count(),
        ];

        return response()->json([
            'stats' => $stats,
            'pets' => $pets,
        ]);
    }

    public function update(Request $request, $id)
    {
        $pet = DB::selectOne("SELECT * FROM pets WHERE id = ?", [$id]);

        if (!$pet) {
            return response()->json(['message' => 'Pet not found'], 404);
        }

        $user = $request->user();

        // Prevent shelter staff from updating pets belonging to other shelters
        if ($user && $user->role === 'shelter_staff') {
            if (!$user->shelter_id || $pet->shelter_id !== $user->shelter_id) {
                return response()->json([
                    'message' => 'Unauthorized. You do not have permission to update this pet.'
                ], 403);
            }
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

    public function destroy(Request $request, $id)
    {
        $pet = DB::selectOne("SELECT * FROM pets WHERE id = ?", [$id]);

        if (!$pet) {
            return response()->json(['message' => 'Pet not found'], 404);
        }

        $user = $request->user();

        // Prevent shelter staff from deleting pets belonging to other shelters
        if ($user && $user->role === 'shelter_staff') {
            if (!$user->shelter_id || $pet->shelter_id !== $user->shelter_id) {
                return response()->json([
                    'message' => 'Unauthorized. You do not have permission to delete this pet.'
                ], 403);
            }
        }

        DB::delete("DELETE FROM pets WHERE id = ?", [$id]);

        return response()->json([
            'message' => 'Pet deleted successfully!'
        ], 200);
    }
}