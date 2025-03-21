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
    public function run() {
        // Create admin user for testing directly with role attribute
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => 'password123', // Will be hashed by the model's mutator
            'email_verified_at' => now(),
            'role' => 'admin' 
        ]);
        
        // Create test brand
        $brand = Brand::create([
            'name' => 'Test Brand',
            'description' => 'Test Brand Description',
        ]);
        
        // Create test category
        $category = Category::create([
            'name' => 'Test Category',
            'description' => 'Test Category Description',
            'slug' => 'test-category'
        ]);

        // Create test products
        for ($i = 1; $i <= 5; $i++) {
            $product = Product::create([
                'name' => "Test Product {$i}",
                'description' => "Test Product {$i} Description",
                'brand_id' => $brand->id,
                'available' => true,
            ]);

            // Attach category
            $product->categories()->attach($category->id);

            // Create test image
            $image = Image::create([
                'name' => "test{$i}.jpg",
                'path' => "images/test{$i}.jpg",
            ]);

            // Attach image to product
            $product->images()->attach($image->id);

            // Create test subproducts
            Subproduct::create([
                'name' => "Test Variant {$i}.1",
                'product_id' => $product->id,
                'price' => 100 * $i,
                'available' => true,
                'sku' => "TST-PRD-{$i}1",
                'stock' => 20 // Add stock for cart tests
            ]);

            Subproduct::create([
                'name' => "Test Variant {$i}.2",
                'product_id' => $product->id,
                'price' => 150 * $i,
                'available' => false,
                'sku' => "TST-PRD-{$i}2",
                'stock' => 10
            ]);
        }
    }
}
