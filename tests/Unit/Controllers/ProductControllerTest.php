<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Services\ProductService;
use App\Http\Controllers\ProductController;
use App\Http\Requests\ProductRequest;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Exceptions\ProductHasOrdersException;
use Illuminate\Support\Facades\Auth;
use Inertia\Response;
use Mockery;
use Inertia\Testing\AssertableInertia;

class ProductControllerTest extends TestCase {
    private ProductController $controller;
    private $productService;

    protected function setUp(): void {
        parent::setUp();
        $this->productService = Mockery::mock(ProductService::class);
        $this->controller = new ProductController($this->productService);
    }

    protected function tearDown(): void {
        parent::tearDown();
        Mockery::close();
    }

    public function test_store_creates_product_successfully() {
        // Arrange
        $productData = [
            'name' => 'Test Product',
            'description' => 'Test Description',
            'brand_id' => 1,
            'categories' => [1, 2],
            'subproducts' => [
                [
                    'name' => 'Variant 1',
                    'sku' => 'TEST-001',
                    'price' => 99.99,
                    'stock' => 10
                ]
            ]
        ];

        $createdProduct = new Product($productData);
        $createdProduct->id = 1;

        $request = Mockery::mock(ProductRequest::class);
        $request->shouldReceive('validated')
            ->once()
            ->andReturn($productData);

        $this->productService->shouldReceive('create')
            ->once()
            ->with($productData)
            ->andReturn($createdProduct);

        // Act
        $response = $this->controller->store($request);

        // Assert
        $this->assertEquals(201, $response->status());
        $this->assertEquals('Product created successfully', $response->headers->get('X-Message'));
        
        $responseData = $response->getData();
        $this->assertTrue($responseData->success);
        
        // Compare properties individually since we're dealing with stdClass vs Model
        $productData = (array)$responseData->product;
        $this->assertEquals($createdProduct->name, $productData['name']);
        $this->assertEquals($createdProduct->description, $productData['description']);
        $this->assertEquals($createdProduct->brand_id, $productData['brand_id']);
        $this->assertEquals($createdProduct->id, $productData['id']);
    }

    public function test_index_returns_paginated_products() {
        // Arrange
        $expectedProducts = [
            'data' => [
                ['id' => 1, 'name' => 'Product 1'],
                ['id' => 2, 'name' => 'Product 2']
            ],
            'total' => 2,
            'per_page' => 10,
            'current_page' => 1
        ];

        $this->productService->shouldReceive('getPaginatedProducts')
            ->once()
            ->with('name', 'asc', 10)
            ->andReturn($expectedProducts);

        // Act
        $response = $this->controller->index(request());

        // Assert
        $this->assertInstanceOf(\Inertia\Response::class, $response);
        
        // Test the component name using reflection
        $responseReflection = new \ReflectionClass($response);
        $componentProperty = $responseReflection->getProperty('component');
        $componentProperty->setAccessible(true);
        $componentName = $componentProperty->getValue($response);
        $this->assertEquals('admin/ProductList', $componentName);
        
        // Test the props using reflection
        $propsProperty = $responseReflection->getProperty('props');
        $propsProperty->setAccessible(true);
        $actualProps = $propsProperty->getValue($response);
        
        $this->assertEquals($expectedProducts, $actualProps['products']);
        $this->assertEquals('name', $actualProps['sortkey']);
        $this->assertEquals('asc', $actualProps['sortdirection']);
    }

    public function test_update_modifies_product() {
        // Arrange
        $productId = 1;
        $updateData = [
            'name' => 'Updated Product',
            'description' => 'Updated Description',
            'brand_id' => 2,
            'categories' => [3, 4]
        ];

        $updatedProduct = new Product($updateData);
        $updatedProduct->id = $productId;

        $request = Mockery::mock(ProductRequest::class);
        $request->shouldReceive('validated')
            ->once()
            ->andReturn($updateData);

        $this->productService->shouldReceive('update')
            ->once()
            ->with($updateData, $productId)
            ->andReturn($updatedProduct);

        // Act
        $response = $this->controller->update($request, $productId);

        // Assert
        $this->assertEquals(200, $response->status());
        $this->assertEquals('Product updated successfully', $response->headers->get('X-Message'));
        
        // Compare properties individually since we're dealing with stdClass vs Model
        $responseData = (array)$response->getData();
        $this->assertEquals($updatedProduct->name, $responseData['name']);
        $this->assertEquals($updatedProduct->description, $responseData['description']);
        $this->assertEquals($updatedProduct->brand_id, $responseData['brand_id']);
        $this->assertEquals($updatedProduct->id, $responseData['id']);
    }

    public function test_destroy_product_as_admin() {
        // Arrange
        $productId = 1;
        
        // Setup Auth mock with proper expectations
        Auth::shouldReceive('user')
            ->once()
            ->andReturn(Mockery::mock(['isAdmin' => true]));
        
        $this->productService->shouldReceive('delete')
            ->once()
            ->with($productId)
            ->andReturn(true);
            
        // Act
        $response = $this->controller->destroy($productId);
        
        // Assert
        $this->assertEquals(204, $response->status());
        $this->assertEquals('Product deleted successfully', $response->headers->get('X-Message'));
    }

    public function test_destroy_product_as_non_admin() {
        // Arrange
        $productId = 1;
        
        // Setup Auth mock with proper expectations
        Auth::shouldReceive('user')
            ->once()
            ->andReturn(Mockery::mock(['isAdmin' => false]));
            
        // Act
        $response = $this->controller->destroy($productId);
        
        // Assert
        $this->assertEquals(403, $response->status());
        $this->assertEquals('Unauthorized action', $response->getData()->message);
    }

    public function test_destroy_non_existent_product() {
        // Arrange
        $productId = 999;
        
        // Setup Auth mock with proper expectations
        Auth::shouldReceive('user')
            ->once()
            ->andReturn(Mockery::mock(['isAdmin' => true]));
        
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
        
        // No need for Auth mock as it won't get that far
        
        // Act
        $response = $this->controller->destroy($invalidId);
        
        // Assert
        $this->assertEquals(404, $response->status());
        $this->assertEquals('Invalid product ID format', $response->getData()->message);
    }

    public function test_destroy_product_with_service_error() {
        // Arrange
        $productId = 1;
        
        // Setup Auth mock with proper expectations
        Auth::shouldReceive('user')
            ->once()
            ->andReturn(Mockery::mock(['isAdmin' => true]));
        
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
        
        // Setup Auth mock with proper expectations
        Auth::shouldReceive('user')
            ->once()
            ->andReturn(Mockery::mock(['isAdmin' => true]));
        
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
