<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductCategoryTest extends TestCase {
    use RefreshDatabase;

    public function test_product_can_be_assigned_to_category() {
        // Arrange
        $product = Product::factory()->create();
        $category = Category::factory()->create();

        // Act
        $product->categories()->attach($category->id);

        // Assert
        $this->assertDatabaseHas('product_categories', [
            'product_id' => $product->id,
            'category_id' => $category->id
        ]);

        $this->assertTrue($product->categories->contains($category));
    }

    public function test_category_can_have_multiple_products() {
        // Arrange
        $category = Category::factory()->create();
        $products = Product::factory()->count(3)->create();

        // Act
        $category->products()->attach($products->pluck('id'));

        // Assert
        $this->assertEquals(3, $category->products->count());
        foreach ($products as $product) {
            $this->assertTrue($category->products->contains($product));
        }
    }

    public function test_product_can_be_assigned_to_multiple_categories() {
        // Arrange
        $product = Product::factory()->create();
        $categories = Category::factory()->count(3)->create();

        // Act
        $product->categories()->attach($categories->pluck('id'));

        // Assert
        $this->assertEquals(3, $product->categories->count());
        foreach ($categories as $category) {
            $this->assertTrue($product->categories->contains($category));
            $this->assertDatabaseHas('product_categories', [
                'product_id' => $product->id,
                'category_id' => $category->id
            ]);
        }
    }

    public function test_product_can_be_detached_from_categories() {
        // Arrange
        $product = Product::factory()->create();
        $categories = Category::factory()->count(3)->create();
        $product->categories()->attach($categories->pluck('id'));

        // Verify initial state
        $this->assertEquals(3, $product->categories->count());

        // Act
        $product->categories()->detach();
        $product->refresh();

        // Assert
        $this->assertEquals(0, $product->categories->count());
        foreach ($categories as $category) {
            $this->assertDatabaseMissing('product_categories', [
                'product_id' => $product->id,
                'category_id' => $category->id
            ]);
        }
    }
}
