<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductTest extends TestCase {
    use RefreshDatabase;

    public function test_product_has_many_subproducts() {
        // Arrange
        $product = \App\Models\Product::factory()->create();
        \App\Models\Subproduct::factory(3)->create(['product_id' => $product->id]);

        // Act & Assert
        $this->assertCount(3, $product->subproducts);
    }

    public function test_product_belongs_to_many_categories() {
        // Arrange
        $product = \App\Models\Product::factory()->create();
        $categories = \App\Models\Category::factory(2)->create();
        $product->categories()->attach($categories->pluck('id'));

        // Act & Assert
        $this->assertCount(2, $product->categories);
    }
}
