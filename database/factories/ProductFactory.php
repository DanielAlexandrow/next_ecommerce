<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductFactory extends Factory {
    protected $model = Product::class;

    public function definition(): array {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'available' => $this->faker->boolean(),
            'brand_id' => Brand::factory(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
