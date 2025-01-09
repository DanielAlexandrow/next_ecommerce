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
            'content' => $request->content,
            'sender_id' => Auth::id(),
            'sender_type' => 'user',
            'user_id' => $request->user_id
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message);
    }

    public function getMessages(Request $request) {
        $messages = ChatMessage::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

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
}
