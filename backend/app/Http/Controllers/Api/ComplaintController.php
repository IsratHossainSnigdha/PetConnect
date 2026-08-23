<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    /**
     * Get complaints belonging to the logged-in adopter.
     */
    public function index(Request $request)
    {
        $complaints = Complaint::where(
            'user_id',
            $request->user()->id
        )
            ->latest()
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

        $complaint = Complaint::create([
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'status' => 'Pending',
        ]);

        return response()->json([
            'message' => 'Complaint submitted successfully.',
            'complaint' => $complaint,
        ], 201);
    }

    /**
     * Show one complaint belonging to the logged-in adopter.
     */
    public function show(Request $request, Complaint $complaint)
    {
        if ($complaint->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        return response()->json([
            'complaint' => $complaint,
        ]);
    }
}