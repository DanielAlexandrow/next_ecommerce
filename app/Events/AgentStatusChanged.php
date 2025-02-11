<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgentStatusChanged implements ShouldBroadcast {
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $status;

    public function __construct($userId, $status) {
        $this->userId = $userId;
        $this->status = $status;
    }

    public function broadcastOn() {
        return new PrivateChannel('chat.' . $this->userId);
    }

    public function broadcastWith() {
        return [
            'status' => $this->status
        ];
    }
}
