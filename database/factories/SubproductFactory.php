<?php

namespace Database\Factories;

use App\Models\Subproduct;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubproductFactory extends Factory {
    protected $model = Subproduct::class;

    public function definition(): array {
        return [
            'name' => fake()->words(3, true),
            'price' => fake()->randomFloat(2, 10, 1000),
            'stock' => fake()->numberBetween(0, 100),
            'sku' => fake()->unique()->ean13(),
            'weight' => fake()->randomFloat(2, 0.1, 10),
            'dimensions' => [
                'length' => fake()->randomFloat(2, 1, 100),
                'width' => fake()->randomFloat(2, 1, 100),
                'height' => fake()->randomFloat(2, 1, 100)
            ],
            'metadata' => [
                'color' => fake()->safeColorName(),
                'material' => fake()->word(),
                'manufacturer' => fake()->company()
            ]
        ];
    }
}
