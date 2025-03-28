<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Review;
use App\Models\SearchHistory;
use App\Models\PopularSearch;
use App\Services\ProductService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Cache;

class ProductServiceTest extends TestCase {
    use RefreshDatabase;

    private ProductService $productService;

    protected function setUp(): void {
        parent::setUp();
        $this->productService = new ProductService();
    }

    /** @test */
    public function test_create_product()
    {
        $data = [
            'name' => 'Test Product',
            'description' => 'Test Description',
            'brand_id' => 1,
            'available' => true,
            'subproducts' => [[
                'name' => 'Standard Variant',
                'price' => 99.99,
                'available' => true,
                'stock' => 10
            ]]
        ];

        $product = $this->productService->createProduct($data);

        $this->assertInstanceOf(Product::class, $product);
        $this->assertEquals('Test Product', $product->name);
        $this->assertEquals('Test Description', $product->description);
        $this->assertCount(1, $product->subproducts);
        
        $subproduct = $product->subproducts->first();
        $this->assertEquals('Standard Variant', $subproduct->name);
        $this->assertEquals(99.99, $subproduct->price);
    }

    /** @test */
    public function it_updates_product_with_relationships() {
        // Arrange
        $product = Product::factory()->create();
        $newCategory = Category::factory()->create();

        $updateData = [
            'name' => 'Updated Product',
            'description' => 'Updated Description',
            'categories' => [$newCategory->id],
            'images' => []
        ];

        // Act
        $updatedProduct = $this->productService->update($updateData, $product->id);

        // Assert
        $this->assertEquals('Updated Product', $updatedProduct->name);
        $this->assertEquals('Updated Description', $updatedProduct->description);
        $this->assertCount(1, $updatedProduct->categories);
        $this->assertEquals($newCategory->id, $updatedProduct->categories->first()->id);
    }

    /** @test */
    public function it_throws_exception_when_updating_non_existent_product() {
        $this->expectException(ModelNotFoundException::class);
        $this->productService->update(['name' => 'Test'], 999);
    }

    /** @test */
    public function it_deletes_product() {
        // Arrange
        $product = Product::factory()->create();

        // Act
        $result = $this->productService->delete($product->id);

        // Assert
        $this->assertTrue($result);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    /** @test */
    public function it_gets_paginated_products() {
        // Arrange
        Product::factory()->count(15)->create();

        // Act
        $result = $this->productService->getPaginatedProducts('created_at', 'desc', 10);

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(10, $result['data']);
        $this->assertEquals(15, $result['total']);
    }

    /** @test */
    public function it_tracks_search_history_for_user() {
        // Arrange
        $user = \App\Models\User::factory()->create();
        $searchTerm = 'test product';

        // Act
        $this->productService->trackSearchHistory($searchTerm, $user->id);

        // Assert
        $this->assertDatabaseHas('search_history', [
            'user_id' => $user->id,
            'search_term' => $searchTerm
        ]);
    }

    /** @test */
    public function it_gets_popular_search_terms() {
        // Arrange
        PopularSearch::create(['search_term' => 'popular1', 'count' => 10]);
        PopularSearch::create(['search_term' => 'popular2', 'count' => 5]);

        // Act
        $result = $this->productService->getPopularSearchTerms(2);

        // Assert
        $this->assertCount(2, $result);
        $this->assertEquals('popular1', $result[0]);
    }

    /** @test */
    public function it_gets_related_products() {
        // Arrange
        $category = Category::factory()->create();
        $product = Product::factory()->create();
        $product->categories()->attach($category->id);

        $relatedProducts = Product::factory()->count(5)->create();
        foreach ($relatedProducts as $related) {
            $related->categories()->attach($category->id);
        }

        // Act
        $result = $this->productService->getRelatedProducts($product->id, 3);

        // Assert
        $this->assertCount(3, $result);
        $this->assertNotContains($product->id, array_column($result, 'id'));
    }

    /** @test */
    public function it_gets_paginated_store_products_with_filters() {
        // Arrange
        $brand = Brand::factory()->create();
        $category = Category::factory()->create();
        $user = \App\Models\User::factory()->create();
        $products = Product::factory()->count(5)->create(['brand_id' => $brand->id]);

        foreach ($products as $product) {
            $product->categories()->attach($category->id);
            $product->subproducts()->create([
                'name' => 'Test Variant',
                'price' => 99.99,
                'stock' => 10,
                'available' => true
            ]);
            Review::factory()->create([
                'user_id' => $user->id,
                'product_id' => $product->id,
                'rating' => 4,
                'content' => 'Test review'
            ]);
        }

        $filters = [
            'name' => $products[0]->name,
            'category' => $category->id,
            'brand' => $brand->id,
            'rating' => 4,
            'inStock' => true,
            'sortKey' => 'average_rating',
            'sortDirection' => 'desc',
            'limit' => 10
        ];

        // Act
        $result = $this->productService->getPaginatedStoreProducts($filters);

        // Assert
        $this->assertIsArray($result);
        $this->assertArrayHasKey('data', $result);
        $this->assertArrayHasKey('meta', $result);
        $this->assertGreaterThan(0, count($result['data']));
    }

    /** @test */
    public function test_handles_price_range_filters()
    {
        // Arrange
        $product = Product::factory()->create();
        $product->subproducts()->create([
            'name' => 'Test Subproduct',
            'price' => 100,
            'stock' => 10,
            'available' => true
        ]);

        $filters = [
            'minPrice' => 50,
            'maxPrice' => 150,
            'limit' => 10
        ];

        // Act
        $result = $this->productService->getPaginatedStoreProducts($filters);

        // Assert
        $this->assertIsArray($result);
        $this->assertGreaterThan(0, count($result['data']));
        $this->assertGreaterThanOrEqual(50, $result['data'][0]['price']);
        $this->assertLessThanOrEqual(150, $result['data'][0]['price']);
    }
}
