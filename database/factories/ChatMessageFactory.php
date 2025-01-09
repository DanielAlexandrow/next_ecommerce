<?php

namespace Database\Factories;

use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChatMessageFactory extends Factory {
    protected $model = ChatMessage::class;

    public function definition() {
        return [
            'content' => $this->faker->sentence(),
            'user_id' => User::factory(),
            'sender_id' => User::factory(),
            'sender_type' => $this->faker->randomElement(['user', 'agent']),
            'created_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'updated_at' => function (array $attributes) {
                return $attributes['created_at'];
            },
        ];
    }

    public function fromUser() {
        return $this->state(function (array $attributes) {
            return [
                'sender_type' => 'user',
            ];
        });
    }

    public function fromAgent() {
        return $this->state(function (array $attributes) {
            return [
                'sender_type' => 'agent',
            ];
        });
    }
}
