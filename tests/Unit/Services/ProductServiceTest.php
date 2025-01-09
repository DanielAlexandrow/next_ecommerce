<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductServiceTest extends TestCase {
    use RefreshDatabase;

    private ProductService $productService;

    protected function setUp(): void {
        parent::setUp();
        $this->productService = app(ProductService::class);
    }

    public function test_it_throws_exception_when_deleting_non_existent_product() {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
        $this->productService->delete(999);
    }

    public function test_it_deletes_product_without_relations() {
        // Arrange
        $product = \App\Models\Product::factory()->create();

        // Act
        $result = $this->productService->delete($product->id);

        // Assert
        $this->assertTrue($result);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_it_handles_concurrent_deletion() {
        // Arrange
        $product = \App\Models\Product::factory()->create();
        $product->delete();

        // Act & Assert
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
        $this->productService->delete($product->id);
    }
}
