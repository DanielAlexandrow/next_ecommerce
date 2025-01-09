<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\Product;
use App\Models\Subproduct;
use App\Models\Image;
use App\Models\Category;

class TestDatabaseSeeder extends Seeder {
    public function run() {
        // Create test brand
        $brand = Brand::create([
            'name' => 'Test Brand',
            'description' => 'Test Brand Description',
        ]);

        // Create test category
        $category = Category::create([
            'name' => 'Test Category',
            'description' => 'Test Category Description',
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
            ]);

            Subproduct::create([
                'name' => "Test Variant {$i}.2",
                'product_id' => $product->id,
                'price' => 150 * $i,
                'available' => false,
            ]);
        }
    }
}
