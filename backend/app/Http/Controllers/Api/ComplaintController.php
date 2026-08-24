<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComplaintController extends Controller
{
    /**
     * Get complaints belonging to the logged-in adopter.
     */
    public function index(Request $request)
    {
        $complaints = DB::table('complaints')
            ->join(
                'users',
                'complaints.user_id',
                '=',
                'users.id'
            )
            ->where(
                'complaints.user_id',
                $request->user()->id
            )
            ->select(
                'complaints.id',
                'complaints.subject',
                'complaints.category',
                'complaints.description',
                'complaints.status',
                'complaints.created_at',
                'users.name as user_name',
                'users.email as user_email'
            )
            ->orderBy(
                'complaints.created_at',
                'desc'
            )
            ->get();

        return response()->json([
            'complaints' => $complaints,
        ]);
    }

    /**
     * Create a new complaint.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => [
                'required',
                'string',
                'max:255',
            ],

            'category' => [
                'required',
                'string',
                'max:100',
            ],

            'description' => [
                'required',
                'string',
            ],
        ]);

        $complaintId = DB::table('complaints')->insertGetId([
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'status' => 'Pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $complaint = DB::table('complaints')
            ->join(
                'users',
                'complaints.user_id',
                '=',
                'users.id'
            )
            ->where('complaints.id', $complaintId)
            ->select(
                'complaints.id',
                'complaints.subject',
                'complaints.category',
                'complaints.description',
                'complaints.status',
                'complaints.created_at',
                'users.name as user_name',
                'users.email as user_email'
            )
            ->first();

        return response()->json([
            'message' => 'Complaint submitted successfully.',
            'complaint' => $complaint,
        ], 201);
    }

    /**
     * Show one complaint belonging to the logged-in adopter.
     */
    public function show(Request $request, $id)
    {
        $complaint = DB::table('complaints')
            ->join(
                'users',
                'complaints.user_id',
                '=',
                'users.id'
            )
            ->where('complaints.id', $id)
            ->where(
                'complaints.user_id',
                $request->user()->id
            )
            ->select(
                'complaints.id',
                'complaints.subject',
                'complaints.category',
                'complaints.description',
                'complaints.status',
                'complaints.created_at',
                'users.name as user_name',
                'users.email as user_email'
            )
            ->first();

        if (!$complaint) {
            return response()->json([
                'message' => 'Complaint not found.',
            ], 404);
        }

        return response()->json([
            'complaint' => $complaint,
        ]);
    }
}