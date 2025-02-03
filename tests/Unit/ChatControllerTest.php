<?php

namespace Tests\Unit;

use App\Http\Controllers\ChatController;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;
use App\Events\MessageSent;
use App\Events\AgentTyping;
use App\Events\AgentStatusChanged;
use Illuminate\Support\Facades\Auth;

class ChatControllerTest extends TestCase
{
    

    public function test_send_message()
    {
        Event::fake();

        $user = User::factory()->create();
        $this->actingAs($user);

        $controller = new ChatController();
        // Create a chat first
        $chat = Chat::factory()->create(['user_id' => $user->id]);
        
        $request = new Request([
            'content' => 'Test message',
            'chat_id' => $chat->id,
        ]);
        $response = $controller->sendMessage($request);

        $this->assertEquals(200, $response->getStatusCode());
        
        Event::assertDispatched(MessageSent::class, function ($event) use ($user) {
            return $event->message->sender_id === $user->id;
        });
    }

    public function test_get_messages()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $mockMessages = [
            ['id' => 1, 'sender_id' => $user->id, 'message_content' => 'Test message 1'],
            ['id' => 2, 'sender_id' => $user->id, 'message_content' => 'Test message 2'],
            ['id' => 3, 'sender_id' => $user->id, 'message_content' => 'Test message 3'],
        ];

        $mockChatMessage = $this->mock(ChatMessage::class, function ($mock) use ($mockMessages) {
            $mock->shouldReceive('where->orderBy->get')->andReturn($mockMessages);
        });

        $controller = new ChatController();
        $chat = Chat::factory()->create(['user_id' => $user->id]);
        $request = new Request(['chat_id' => $chat->id]);
        $response = $controller->getMessages($request);

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertCount(3, $response->getData());
    }

    public function test_agent_typing()
    {
        Event::fake();

        $user = User::factory()->create();
        $this->actingAs($user);

        $controller = new ChatController();
        $request = new Request(['user_id' => $user->id]);
        $response = $controller->agentTyping($request);

        $this->assertEquals(200, $response->getStatusCode());

        Event::assertDispatched(AgentTyping::class, function ($event) use ($user) {
            return $event->userId === $user->id;
        });
    }

    public function test_agent_status_change()
    {
        Event::fake();

        $user = User::factory()->create();
        $this->actingAs($user);

        $controller = new ChatController();
        $request = new Request([
            'status' => 'online',
            'user_id' => $user->id,
        ]);
        $response = $controller->agentStatusChange($request);

        $this->assertEquals(200, $response->getStatusCode());

         Event::assertDispatched(AgentStatusChanged::class, function ($event) use ($user) {
            return $event->userId === $user->id && $event->status === 'online';
        });
    }

    public function test_initiate_chat()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $controller = new ChatController();
        $request = new Request();
        $response = $controller->initiateChat($request);

        $this->assertEquals(200, $response->getStatusCode());
    }
}
