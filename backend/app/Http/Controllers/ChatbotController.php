<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PetChatbotService;

class ChatbotController extends Controller
{
    public function message(
        Request $request,
        PetChatbotService $chatbot
    ) {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $result = $chatbot->chat(
            $request->message
        );

        return response()->json([
            'success' => true,
            'question' => $result['question'],
            'answer' => $result['answer'],
            'context' => $result['context'],
        ]);
    }
}