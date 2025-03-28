<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Subproduct;
use App\Models\Image;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestDatabaseSeeder extends Seeder {
    public function run(): void
    {
        // Create test products with variants
        for ($i = 1; $i <= 3; $i++) {
            $product = Product::factory()->create([
                'name' => "Test Product {$i}",
                'description' => "Test Description {$i}",
                'available' => true
            ]);

            // Available variant
            Subproduct::factory()->create([
                'name' => "Standard Variant {$i}",
                'price' => 99.99,
                'product_id' => $product->id,
                'available' => true,
                'stock' => 20 // Add stock for cart tests
            ]);

            // Unavailable variant
            Subproduct::factory()->create([
                'name' => "Premium Variant {$i}",
                'price' => 149.99,
                'product_id' => $product->id,
                'available' => false,
                'stock' => 10
            ]);
        }
    }
}
