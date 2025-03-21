<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgentTyping implements ShouldBroadcast {
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;

    public function __construct($userId) {
        $this->userId = $userId;
    }

    public function broadcastOn() {
        return new PrivateChannel('chat.' . $this->userId);
    }
}
