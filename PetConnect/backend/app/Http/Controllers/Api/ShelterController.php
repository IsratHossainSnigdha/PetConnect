<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Application; 

class ShelterController extends Controller
{
    public function dashboardStats()
    {
      
        $petsArray = DB::select("SELECT * FROM pets");
        $pets = collect($petsArray);
        
        $stats = [
            'total' => $pets->count(),
            'available' => $pets->filter(fn($p) => strcasecmp($p->status, 'Available') === 0)->count(),
            'treatment' => $pets->filter(fn($p) => strcasecmp($p->status, 'Treatment') === 0)->count(),
            'adopted' => $pets->filter(fn($p) => strcasecmp($p->status, 'Adopted') === 0)->count(),
            'pending' => $pets->filter(fn($p) => strcasecmp($p->status, 'Pending') === 0)->count(),
        ];

       
        $recentPets = DB::select("SELECT * FROM pets ORDER BY created_at DESC LIMIT 5");
        
        $adoptionRequests = [];
        try {
            if (class_exists(Application::class)) {
               
                $rawRequests = DB::select("
                    SELECT applications.*, users.name as user_name, pets.name as pet_name 
                    FROM applications 
                    LEFT JOIN users ON applications.user_id = users.id 
                    LEFT JOIN pets ON applications.pet_id = pets.id 
                    ORDER BY applications.created_at DESC 
                    LIMIT 5
                ");

                $adoptionRequests = array_map(function ($req) {
                    $createdAt = $req->created_at ? \Carbon\Carbon::parse($req->created_at) : null;

                    return [
                        'name' => $req->user_name ?? 'Unknown User',
                        'pet' => $req->pet_name ?? 'Unknown Pet',
                        'date' => $createdAt ? $createdAt->diffForHumans() : '',
                        'status' => $req->status ?? 'Pending',
                    ];
                }, $rawRequests);
            }
        } catch (\Exception $e) {
            $adoptionRequests = [];
        }

        return response()->json([
            'stats' => $stats,
            'pets' => $recentPets,
            'adoptionRequests' => $adoptionRequests,
        ]);
    }
}