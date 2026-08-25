<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class PetController extends Controller
{
    public function index()
    {
        $pets = DB::select("SELECT * FROM pets");

        return response()->json($pets);
    }
}