<?php
namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\Category;
use App\Services\CategoryService;
use App\Http\Controllers\CategoryController;
use App\Http\Requests\CategoryRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Mockery;

class CategoryControllerTest extends TestCase {
use RefreshDatabase;

private CategoryController $controller;
private $categoryService;

protected function setUp(): void {
parent::setUp();
$this->categoryService = Mockery::mock(CategoryService::class);
$this->controller = new CategoryController($this->categoryService);
}

protected function tearDown(): void {
Mockery::close();
parent::tearDown();
}

public function test_index_returns_categories() {
// Arrange
$categories = [
['id' => 1, 'name' => 'Category 1'],
['id' => 2, 'name' => 'Category 2']
];
$this->categoryService->shouldReceive('getAllWithProductCount')
->once()
->andReturn($categories);

// Act
$response = $this->controller->index();

// Assert
$this->assertEquals(200, $response->status());
$this->assertEquals($categories, $response->getData()->categories);
}

public function test_store_creates_new_category() {
// Arrange
$categoryData = [
'name' => 'New Category',
'description' => 'Description'
];
$category = new Category($categoryData);
$category->id = 1;

$request = new CategoryRequest($categoryData);

$this->categoryService->shouldReceive('store')
->once()
->with($categoryData)
->andReturn($category);

// Act
$response = $this->controller->store($request);

// Assert
$this->assertEquals(201, $response->status());
$this->assertEquals($category, $response->getData()->category);
}

public function test_update_modifies_category() {
// Arrange
$categoryId = 1;
$updateData = [
'name' => 'Updated Category',
'description' => 'Updated Description'
];
$category = new Category($updateData);
$category->id = $categoryId;

$request = new CategoryRequest($updateData);

$this->categoryService->shouldReceive('update')
->once()
->with($categoryId, $updateData)
->andReturn($category);

// Act
$response = $this->controller->update($request, $categoryId);

// Assert
$this->assertEquals(200, $response->status());
$this->assertEquals($category, $response->getData()->category);
}

public function test_destroy_deletes_category() {
// Arrange
$categoryId = 1;
$this->categoryService->shouldReceive('delete')
->once()
->with($categoryId)
->andReturn(true);

// Act
$response = $this->controller->destroy($categoryId);

// Assert
$this->assertEquals(200, $response->status());
$this->assertTrue($response->getData()->success);
}

public function test_search_finds_categories() {
// Arrange
$query = 'test';
$categories = collect([
new Category(['name' => 'Test Category']),
new Category(['name' => 'Another Test'])
]);

$request = new Request(['query' => $query]);

$this->categoryService->shouldReceive('search')
->once()
->with($query)
->andReturn($categories);

// Act
$response = $this->controller->search($request);

// Assert
$this->assertEquals(200, $response->status());
$this->assertEquals($categories->toArray(), $response->getData()->categories);
}

public function test_bulk_delete_removes_multiple_categories() {
// Arrange
$ids = [1, 2, 3];
$request = new Request(['ids' => $ids]);

$this->categoryService->shouldReceive('bulkDelete')
->once()
->with($ids)
->andReturn(true);

// Act
$response = $this->controller->bulkDelete($request);

// Assert
$this->assertEquals(200, $response->status());
$this->assertTrue($response->getData()->success);
}

public function test_get_hierarchy_returns_hierarchical_categories() {
// Arrange
$categories = collect([
new Category([
'id' => 1,
'name' => 'Parent',
'children' => collect([
new Category(['id' => 2, 'name' => 'Child'])
])
])
]);

$this->categoryService->shouldReceive('getHierarchicalCategories')
->once()
->andReturn($categories);

// Act
$response = $this->controller->getHierarchy();

// Assert
$this->assertEquals(200, $response->status());
$this->assertEquals($categories->toArray(), $response->getData()->categories);
}
}