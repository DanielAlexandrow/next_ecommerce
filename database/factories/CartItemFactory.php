<?php

namespace Database\Factories;

use App\Models\CartItem;
use App\Models\Cart;
use App\Models\Subproduct;
use Illuminate\Database\Eloquent\Factories\Factory;

class CartItemFactory extends Factory {
    protected $model = CartItem::class;

    public function definition() {
        return [
            'cart_id' => Cart::factory(),
            'subproduct_id' => Subproduct::factory(),
            'quantity' => $this->faker->numberBetween(1, 5),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
