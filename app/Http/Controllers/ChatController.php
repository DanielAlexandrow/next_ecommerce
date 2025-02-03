<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\AgentTyping;
use App\Events\AgentStatusChanged;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller {
    public function sendMessage(Request $request) {
        $request->validate([
            'content' => 'required|string|max:1000',
            'user_id' => 'required|exists:users,id'
        ]);

        $message = ChatMessage::create([
            'chat_id' => $request->chat_id, // Assuming chat_id is passed in request
            'sender_id' => Auth::id(),
            'receiver_id' => $request->user_id, // Assuming receiver_id is user_id from request
            'message_content' => $request->content,
            'timestamp' => now() // Use now() for timestamp
        ]);

        broadcast(new MessageSent($message)); // Removed ->toOthers() for now, might need to adjust based on requirements

        return response()->json($message);
    }

    public function getMessages(Request $request) {
        $request->validate([
            'chat_id' => 'required|exists:chat_messages,chat_id' // Validate chat_id is provided
        ]);

        $messages = ChatMessage::where('chat_id', $request->chat_id)
            ->orderBy('timestamp', 'asc') // Chronological order
            ->get(); // Removed take(50) for now to get full history

        return response()->json($messages);
    }

    public function agentTyping(Request $request) {
        broadcast(new AgentTyping($request->user_id))->toOthers();
        return response()->json(['status' => 'ok']);
    }

    public function agentStatusChange(Request $request) {
        $request->validate([
            'status' => 'required|in:online,offline'
        ]);

        broadcast(new AgentStatusChanged($request->user_id, $request->status))->toOthers();
        return response()->json(['status' => 'ok']);
    }

    public function initiateChat(Request $request) {
        $chatId = uniqid('chat_'); // Generate unique chat_id, you might want to use a more robust method

        return response()->json(['chat_id' => $chatId]);
    }
}
