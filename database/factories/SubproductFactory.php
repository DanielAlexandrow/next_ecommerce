<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubproductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'price' => fake()->randomFloat(2, 10, 1000),
            'product_id' => Product::factory(),
            'available' => fake()->boolean(80),
            'stock' => fake()->numberBetween(0, 100),
            'weight' => fake()->randomFloat(2, 0.1, 10),
            'dimensions' => [
                'length' => fake()->randomFloat(2, 1, 100),
                'width' => fake()->randomFloat(2, 1, 100),
                'height' => fake()->randomFloat(2, 1, 100)
            ]
        ];
    }
}
