<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use App\Models\Guest;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory {
    protected $model = Order::class;

    public function definition() {
        $items = [
            [
                'id' => $this->faker->numberBetween(1, 100),
                'quantity' => $this->faker->numberBetween(1, 5),
                'price' => $this->faker->randomFloat(2, 10, 100),
                'name' => $this->faker->words(3, true),
                'variant' => $this->faker->word()
            ]
        ];

        return [
            'user_id' => User::factory(),
            'guest_id' => null,
            'items' => $items,
            'total' => function (array $attributes) {
                $total = 0;
                foreach ($attributes['items'] as $item) {
                    $total += $item['price'] * $item['quantity'];
                }
                return $total;
            },
            'status' => $this->faker->randomElement(['pending', 'processing', 'completed', 'cancelled']),
            'payment_status' => $this->faker->randomElement(['pending', 'paid', 'refunded']),
            'shipping_status' => $this->faker->randomElement(['pending', 'shipped', 'delivered']),
            'shipping_address' => [
                'street' => $this->faker->streetAddress,
                'city' => $this->faker->city,
                'country' => $this->faker->country
            ],
            'billing_address' => function (array $attributes) {
                return $attributes['shipping_address'];
            }
        ];
    }

    public function forGuest() {
        return $this->state(function (array $attributes) {
            return [
                'user_id' => null,
                'guest_id' => Guest::factory()
            ];
        });
    }
}
