<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Services\ProductService;
use App\Http\Controllers\ProductController;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Exceptions\ProductHasOrdersException;
use Mockery;
use Spatie\Permission\Models\Role;

class ProductControllerTest extends TestCase {
    use RefreshDatabase;

    private ProductController $controller;
    private $productService;
    private $admin;
    private $user;

    protected function setUp(): void {
        parent::setUp();

        // Create admin role first
        Role::create(['name' => 'admin']);

        // Setup service mock
        $this->productService = Mockery::mock(ProductService::class);
        $this->controller = new ProductController($this->productService);

        // Create admin user
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');

        // Create regular user
        $this->user = User::factory()->create();
    }

    protected function tearDown(): void {
        Mockery::close();
        parent::tearDown();
    }

    public function test_destroy_product_as_admin() {
        // Arrange
        $productId = 1;
        $this->actingAs($this->admin);

        $this->productService->shouldReceive('delete')
            ->once()
            ->with($productId)
            ->andReturn(true);

        // Act
        $response = $this->controller->destroy($productId);

        // Assert
        $this->assertEquals(200, $response->status());
        $this->assertEquals('Product deleted successfully', $response->getData()->message);
    }

    public function test_destroy_product_as_non_admin() {
        // Arrange
        $productId = 1;
        $this->actingAs($this->user);

        // Act
        $response = $this->controller->destroy($productId);

        // Assert
        $this->assertEquals(403, $response->status());
        $this->assertEquals('Unauthorized action', $response->getData()->message);
    }

    public function test_destroy_non_existent_product() {
        // Arrange
        $productId = 999;
        $this->actingAs($this->admin);

        $this->productService->shouldReceive('delete')
            ->once()
            ->with($productId)
            ->andThrow(new ModelNotFoundException());

        // Act
        $response = $this->controller->destroy($productId);

        // Assert
        $this->assertEquals(404, $response->status());
        $this->assertEquals('Product not found', $response->getData()->message);
    }

    public function test_destroy_product_with_invalid_id() {
        // Arrange
        $invalidId = 'not-a-number';
        $this->actingAs($this->admin);

        // Act
        $response = $this->controller->destroy($invalidId);

        // Assert
        $this->assertEquals(404, $response->status());
        $this->assertEquals('Invalid product ID format', $response->getData()->message);
    }

    public function test_destroy_product_with_service_error() {
        // Arrange
        $productId = 1;
        $this->actingAs($this->admin);

        $this->productService->shouldReceive('delete')
            ->once()
            ->with($productId)
            ->andThrow(new \Exception('Database error'));

        // Act
        $response = $this->controller->destroy($productId);

        // Assert
        $this->assertEquals(500, $response->status());
        $this->assertEquals('Failed to delete product', $response->getData()->message);
    }

    public function test_destroy_product_with_related_orders() {
        // Arrange
        $productId = 1;
        $this->actingAs($this->admin);

        $this->productService->shouldReceive('delete')
            ->once()
            ->with($productId)
            ->andThrow(new ProductHasOrdersException('Cannot delete product with existing orders'));

        // Act
        $response = $this->controller->destroy($productId);

        // Assert
        $this->assertEquals(409, $response->status());
        $this->assertEquals('Cannot delete product with existing orders', $response->getData()->message);
    }
}
