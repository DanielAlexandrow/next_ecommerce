<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\Store\StoreProductController;
use App\Services\ProductService;
use App\Models\Product;
use Illuminate\Http\Request;
use Mockery;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\Eloquent\Builder;
use Mockery\MockInterface;

class StoreProductControllerTest extends TestCase
{
    private StoreProductController $controller;
    private $productService;
    private $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->productService = Mockery::mock(ProductService::class);
        $this->controller = new StoreProductController($this->productService);
        
        // Create a base product mock that can be reused
        $this->product = Mockery::mock();
        $this->product->id = 1;
        $this->product->name = 'Test Product';
        $this->product->description = 'Test Description';
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        Mockery::close();
    }


    public function test_search_returns_filtered_products()
    {
        // Arrange
        $request = new Request();
        $request->merge([
            'name' => 'test',
            'minPrice' => 10,
            'maxPrice' => 100,
            'sortBy' => 'price_asc'
        ]);
        
        $products = collect([
            (object)['id' => 1, 'name' => 'Test Product 1'],
            (object)['id' => 2, 'name' => 'Test Product 2']
        ]);
        
        $expectedProducts = [
            'data' => $products->toArray(),
            'total' => 2,
            'per_page' => 12,
            'current_page' => 1,
            'last_page' => 1
        ];
        
        $this->productService->shouldReceive('getPaginatedStoreProducts')
            ->once()
            ->with([
                'name' => 'test',
                'minPrice' => 10,
                'maxPrice' => 100,
                'sortKey' => 'price',
                'sortDirection' => 'asc',
                'limit' => 12
            ])
            ->andReturn($expectedProducts);
        
        // Act
        $response = $this->controller->search($request);
        
        // Assert
        $this->assertEquals(200, $response->status());
        $responseData = $response->getData();
        $this->assertEquals($products->toArray(), $responseData->products);
        $this->assertEquals($expectedProducts['total'], $responseData->pagination->total);
        $this->assertEquals($expectedProducts['per_page'], $responseData->pagination->per_page);
        $this->assertEquals($expectedProducts['current_page'], $responseData->pagination->current_page);
        $this->assertEquals($expectedProducts['last_page'], $responseData->pagination->last_page);
    }

    public function test_search_uses_default_sort_params()
    {
        // Arrange
        $request = new Request();
        
        $expectedProducts = [
            'data' => [],
            'total' => 0,
            'per_page' => 12,
            'current_page' => 1,
            'last_page' => 1
        ];
        
        $this->productService->shouldReceive('getPaginatedStoreProducts')
            ->once()
            ->with([
                'name' => '',
                'minPrice' => 0,
                'maxPrice' => 1000,
                'sortKey' => 'created_at',
                'sortDirection' => 'desc',
                'limit' => 12
            ])
            ->andReturn($expectedProducts);
        
        // Act
        $response = $this->controller->search($request);
        
        // Assert
        $this->assertEquals(200, $response->status());
        $responseData = $response->getData();
        $this->assertEquals($expectedProducts['data'], $responseData->products);
    }

    public function test_sort_key_mapping()
    {
        // Test private method getSortKey through search method
        $testCases = [
            'price_asc' => 'price',
            'price_desc' => 'price',
            'name_asc' => 'name',
            'name_desc' => 'name',
            'rating_desc' => 'average_rating',
            'newest' => 'created_at',
            'invalid_key' => 'created_at'
        ];
        
        foreach ($testCases as $input => $expected) {
            $request = new Request();
            $request->merge(['sortBy' => $input]);
            
            $this->productService->shouldReceive('getPaginatedStoreProducts')
                ->once()
                ->withArgs(function ($args) use ($expected) {
                    return $args['sortKey'] === $expected;
                })
                ->andReturn([
                    'data' => [],
                    'total' => 0,
                    'per_page' => 12,
                    'current_page' => 1,
                    'last_page' => 1
                ]);
                
            $this->controller->search($request);
        }
    }

    public function test_sort_direction_mapping()
    {
        // Test private method getSortDirection through search method
        $testCases = [
            'price_desc' => 'desc',
            'price_asc' => 'asc',
            'name_desc' => 'desc',
            'name_asc' => 'asc',
            'rating_desc' => 'desc',
            'newest' => 'desc',
            'invalid_key' => 'desc'
        ];
        
        foreach ($testCases as $input => $expected) {
            $request = new Request();
            $request->merge(['sortBy' => $input]);
            
            $this->productService->shouldReceive('getPaginatedStoreProducts')
                ->once()
                ->withArgs(function ($args) use ($expected) {
                    return $args['sortDirection'] === $expected;
                })
                ->andReturn([
                    'data' => [],
                    'total' => 0,
                    'per_page' => 12,
                    'current_page' => 1,
                    'last_page' => 1
                ]);
                
            $this->controller->search($request);
        }
    }
}