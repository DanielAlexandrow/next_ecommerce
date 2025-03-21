<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Models\Category;
use App\Models\Product;
use App\Models\Review;
use App\Services\CategoryService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CategoryServiceTest extends TestCase
{
    use RefreshDatabase;

    private CategoryService $categoryService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->categoryService = new CategoryService();
    }

    /** @test */
    public function it_gets_all_categories_with_relationships()
    {
        // Arrange
        $parent = Category::factory()->create();
        $child = Category::factory()->create(['parent_id' => $parent->id]);
        Product::factory()->create()->categories()->attach($parent->id);

        // Act
        $result = $this->categoryService->getAll();

        // Assert
        $this->assertIsArray($result);
        $this->assertCount(2, $result);
        $this->assertEquals($parent->id, $result[0]['id']);
        $this->assertEquals(1, $result[0]['products_count']);
        $this->assertEquals(1, $result[0]['children_count']);
    }

    /** @test */
    public function it_gets_all_categories_with_product_count()
    {
        // Arrange
        $category = Category::factory()->create();
        Product::factory()->count(3)->create()
            ->each(fn($product) => $product->categories()->attach($category->id));

        // Act
        $result = $this->categoryService->getAllWithProductCount();

        // Assert
        $this->assertIsArray($result);
        $this->assertEquals(3, $result[0]['products_count']);
    }

    /** @test */
    public function it_gets_hierarchical_categories()
    {
        // Arrange
        $parent = Category::factory()->create(['parent_id' => null]);
        $children = Category::factory()->count(2)->create(['parent_id' => $parent->id]);
        
        // Act
        $result = $this->categoryService->getHierarchicalCategories();

        // Assert
        $this->assertCount(1, $result);
        $this->assertCount(2, $result[0]->children);
    }

    /** @test */
    public function it_stores_new_category()
    {
        // Arrange
        $data = [
            'name' => 'Test Category',
            'description' => 'Test Description'
        ];

        // Act
        $result = $this->categoryService->store($data);

        // Assert
        $this->assertInstanceOf(Category::class, $result);
        $this->assertEquals('Test Category', $result->name);
        $this->assertDatabaseHas('categories', $data);
    }

    /** @test */
    public function it_updates_existing_category()
    {
        // Arrange
        $category = Category::factory()->create();
        $updateData = [
            'name' => 'Updated Name',
            'description' => 'Updated Description'
        ];

        // Act
        $result = $this->categoryService->update($category->id, $updateData);

        // Assert
        $this->assertEquals('Updated Name', $result->name);
        $this->assertDatabaseHas('categories', $updateData);
    }

    /** @test */
    public function it_throws_exception_when_updating_non_existent_category()
    {
        $this->expectException(ModelNotFoundException::class);
        $this->categoryService->update(999, ['name' => 'Test']);
    }

    /** @test */
    public function it_deletes_category_and_its_children()
    {
        // Arrange
        $parent = Category::factory()->create();
        $child1 = Category::factory()->create(['parent_id' => $parent->id]);
        $child2 = Category::factory()->create(['parent_id' => $parent->id]);

        // Act
        $result = $this->categoryService->delete($parent->id);

        // Assert
        $this->assertTrue($result);
        $this->assertDatabaseMissing('categories', ['id' => $parent->id]);
        $this->assertDatabaseMissing('categories', ['id' => $child1->id]);
        $this->assertDatabaseMissing('categories', ['id' => $child2->id]);
    }

    /** @test */
    public function it_searches_categories()
    {
        // Arrange
        Category::factory()->create(['name' => 'Test Category']);
        Category::factory()->create(['description' => 'Test Description']);
        Category::factory()->create(['name' => 'Other']);

        // Act
        $result = $this->categoryService->search('Test');

        // Assert
        $this->assertCount(2, $result);
    }

    /** @test */
    public function it_bulk_deletes_categories()
    {
        // Arrange
        $categories = Category::factory()->count(3)->create();
        $ids = $categories->pluck('id')->toArray();

        // Act
        $result = $this->categoryService->bulkDelete($ids);

        // Assert
        $this->assertTrue($result);
        foreach ($ids as $id) {
            $this->assertDatabaseMissing('categories', ['id' => $id]);
        }
    }

    /** @test */
    public function it_finds_category_by_id()
    {
        // Arrange
        $category = Category::factory()->create();

        // Act
        $result = $this->categoryService->findById($category->id);

        // Assert
        $this->assertInstanceOf(Category::class, $result);
        $this->assertEquals($category->id, $result->id);
    }

    /** @test */
    public function it_throws_exception_when_finding_non_existent_category()
    {
        $this->expectException(ModelNotFoundException::class);
        $this->categoryService->findById(999);
    }

    /** @test */
    public function it_gets_all_categories_with_stats()
    {
        // Arrange
        $category = Category::factory()->create();
        $product = Product::factory()->create();
        $product->categories()->attach($category->id);
        
        $user = \App\Models\User::factory()->create();
        
        // Create reviews with ratings - changed 'comment' to 'content'
        Review::factory()->count(2)->create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => 4,
            'content' => 'Test review'
        ]);

        // Act
        $result = $this->categoryService->getAllWithStats();

        // Assert
        $this->assertCount(1, $result);
        $result = $result->first();
        $this->assertEquals($category->id, $result['id']);
        $this->assertEquals(1, $result['products_count']);
        $this->assertEquals(0, $result['children_count']);
        $this->assertEquals(2, $result['total_reviews']);
        $this->assertEquals(4, $result['average_rating']);
    }
}
