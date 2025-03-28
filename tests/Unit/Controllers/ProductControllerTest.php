<?php
namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Subproduct;
use App\Http\Controllers\ProductController;
use App\Http\Requests\ProductRequest;
use App\Http\Requests\CreateProductRequest;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;
    
    private ProductController $controller;
    private ProductService $productService;
    private User $adminUser;
    private User $customerUser;
    private Brand $brand;
    private array $categories;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create real ProductService
        $this->productService = new ProductService();
        
        // Create the controller with real ProductService
        $this->controller = new ProductController($this->productService);
        
        // Create test users
        $this->adminUser = User::factory()->create(['role' => 'admin']);
        $this->customerUser = User::factory()->create(['role' => 'customer']);
        
        // Create a brand for testing
        $this->brand = Brand::create(['name' => 'Test Brand']);
        
        // Create some categories
        $this->categories = [
            Category::create([
                'name' => 'Category 1',
                'slug' => 'category-1',
                'description' => 'Test Category 1'
            ])->id,
            Category::create([
                'name' => 'Category 2',
                'slug' => 'category-2',
                'description' => 'Test Category 2'
            ])->id
        ];
    }

    public function test_store_creates_product_successfully()
    {
        // Arrange
        $this->actingAs($this->adminUser);
        
        $productData = [
            'name' => 'Test Product',
            'description' => 'Test Description',
            'brand_id' => $this->brand->id,
            'available' => true,
            'categories' => $this->categories,
            'subproducts' => [
                [
                    'name' => 'Variant 1',
                    'price' => 99.99,
                    'stock' => 10,
                    'available' => true
                ]
            ]
        ];
        
        // Create and configure the request with real data
        $request = CreateProductRequest::create('/products', 'POST', $productData);
        $request->setContainer(app())->validateResolved();

        // Override the validated method to return our test data
        $request->merge($productData);
        $request->method('validated', function() use ($productData) {
            return $productData;
        });
        
        // Act
        $response = $this->controller->store($request);
        
        // Assert
        $this->assertEquals(201, $response->status());
        $responseData = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('id', $responseData);
        $this->assertEquals('Test Product', $responseData['name']);
        $this->assertEquals('Test Description', $responseData['description']);
        $this->assertEquals($this->brand->id, $responseData['brand_id']);
        
        // Verify product was actually created in the database
        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'description' => 'Test Description'
        ]);
    }

    public function test_index_returns_paginated_products()
    {
        // Arrange
        $this->actingAs($this->adminUser);
        
        // Create some test products
        Product::create([
            'name' => 'Product 1',
            'description' => 'Description 1',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);
        
        Product::create([
            'name' => 'Product 2',
            'description' => 'Description 2',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);
        
        $request = Request::create('/products', 'GET');
        
        // Act
        $response = $this->controller->index($request);
        
        // Assert
        $this->assertEquals('admin/ProductList', $response->getComponent());
        $props = $response->getProps();
        
        $this->assertArrayHasKey('products', $props);
        $this->assertArrayHasKey('data', $props['products']);
        $this->assertCount(2, $props['products']['data']);
        $this->assertEquals('name', $props['sortkey']);
        $this->assertEquals('asc', $props['sortdirection']);
    }

    public function test_update_modifies_product()
    {
        // Arrange
        $this->actingAs($this->adminUser);
        
        // Create a test product
        $product = Product::create([
            'name' => 'Original Product',
            'description' => 'Original Description',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);
        
        $updateData = [
            'name' => 'Updated Product',
            'description' => 'Updated Description',
            'brand_id' => $this->brand->id,
            'available' => true,
            'categories' => $this->categories
        ];
        
        // Create and configure the request
        $request = ProductRequest::create("/products/{$product->id}", 'PUT', $updateData);
        $request->setContainer(app())->validateResolved();
        
        // Override the validated method
        $request->merge($updateData);
        $request->method('validated', function() use ($updateData) {
            return $updateData;
        });
        
        // Act
        $response = $this->controller->update($request, $product->id);
        
        // Assert
        $this->assertEquals(200, $response->status());
        $responseData = json_decode($response->getContent(), true);
        $this->assertEquals('Updated Product', $responseData['name']);
        $this->assertEquals('Updated Description', $responseData['description']);
        
        // Verify the product was updated in the database
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Updated Product',
            'description' => 'Updated Description'
        ]);
    }

    public function test_destroy_product_as_admin()
    {
        // Arrange
        $this->actingAs($this->adminUser);
        
        $product = Product::create([
            'name' => 'Product to Delete',
            'description' => 'Will be deleted',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);
        
        // Act
        $response = $this->controller->destroy($product->id);
        
        // Assert
        $this->assertEquals(204, $response->status());
        $this->assertEquals('Product deleted successfully', $response->headers->get('X-Message'));
        
        // Verify product was actually deleted
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_destroy_product_as_non_admin()
    {
        // Arrange
        $this->actingAs($this->customerUser);
        
        $product = Product::create([
            'name' => 'Product That Should Not Be Deleted',
            'description' => 'Should not be allowed to delete',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);
        
        // Act
        $response = $this->controller->destroy($product->id);
        
        // Assert
        $this->assertEquals(403, $response->status());
        $responseData = json_decode($response->getContent());
        $this->assertEquals('Unauthorized action', $responseData->message);
        
        // Verify product still exists
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    public function test_destroy_non_existent_product()
    {
        // Arrange
        $this->actingAs($this->adminUser);
        
        // Non-existent ID
        $nonExistentId = 9999;
        
        // Act
        $response = $this->controller->destroy($nonExistentId);
        
        // Assert
        $this->assertEquals(404, $response->status());
        $responseData = json_decode($response->getContent());
        $this->assertEquals('Product not found', $responseData->message);
    }

    public function test_destroy_product_with_invalid_id()
    {
        // Arrange
        $this->actingAs($this->adminUser);
        
        // Invalid ID format
        $invalidId = 'not-a-number';
        
        // Act
        $response = $this->controller->destroy($invalidId);
        
        // Assert
        $this->assertEquals(404, $response->status());
        $responseData = json_decode($response->getContent());
        $this->assertEquals('Invalid product ID format', $responseData->message);
    }

    public function test_destroy_product_with_service_error()
    {
        // Arrange
        $this->actingAs($this->adminUser);
        
        $product = Product::create([
            'name' => 'Product with Error',
            'description' => 'Will cause service error',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);
        
        // Create a partial mock of ProductService just for this specific test
        $mockService = $this->partialMock(ProductService::class, function ($mock) use ($product) {
            $mock->shouldReceive('delete')
                ->once()
                ->with($product->id)
                ->andThrow(new \Exception('Database error'));
        });
        
        // Replace the controller's service with our partial mock
        app()->instance(ProductService::class, $mockService);
        $controller = app()->make(ProductController::class);
        
        // Act
        $response = $controller->destroy($product->id);
        
        // Assert
        $this->assertEquals(500, $response->status());
        $responseData = json_decode($response->getContent());
        $this->assertEquals('Failed to delete product', $responseData->message);
    }

    public function test_destroy_product_with_related_orders()
    {
        // Arrange
        $this->actingAs($this->adminUser);
        
        // Create product with subproduct
        $product = Product::create([
            'name' => 'Product with Orders',
            'description' => 'Has related orders',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);
        
        $subproduct = Subproduct::create([
            'name' => 'Variant',
            'price' => 10.99,
            'product_id' => $product->id,
            'available' => true,
            'stock' => 5
        ]);
        
        // Create an order with this product
        $order = Order::create([
            'user_id' => $this->customerUser->id,
            'total' => 10.99,
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending'
        ]);
        
        OrderItem::create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct->id,
            'quantity' => 1,
            'price' => 10.99
        ]);
        
        // Act
        $response = $this->controller->destroy($product->id);
        
        // Assert
        $this->assertEquals(409, $response->status());
        $responseData = json_decode($response->getContent());
        $this->assertEquals('Cannot delete product with existing orders', $responseData->message);
        
        // Verify product still exists
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }
}
