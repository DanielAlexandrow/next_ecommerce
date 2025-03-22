<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Brand;
use App\Services\BrandService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class BrandControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $user;
    protected $mockBrandService;
    protected $testBrands;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test users
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->user = User::factory()->create(['role' => 'customer']);
        
        // Create test brands
        $this->testBrands = $this->createTestBrands();
        
        // Mock the brand service
        $this->mockBrandService = Mockery::mock(BrandService::class);
        $this->app->instance(BrandService::class, $this->mockBrandService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    protected function createTestBrands()
    {
        return Brand::factory()->count(5)->create();
    }

    public function test_index_page_requires_admin_authentication()
    {
        // Act as unauthenticated user
        $response = $this->get('/brands');
        
        // Assert that we're redirected to login
        $response->assertStatus(302);
        $response->assertRedirect('/login');
        
        // Act as authenticated non-admin user
        $response = $this->actingAs($this->user)->get('/brands');
        
        // Assert that access is forbidden
        $response->assertStatus(403);
    }

    public function test_admin_can_access_brands_index()
    {
        // Setup mock expectations
        $this->mockBrandService->shouldReceive('getPaginatedBrands')
            ->once()
            ->with('name', 'asc', 10)
            ->andReturn(['data' => $this->testBrands]);
        
        // Act as admin
        $response = $this->actingAs($this->admin)->get('/brands');
        
        // Assert response
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/BrandsPage')
            ->has('brands')
            ->has('sortkey')
            ->has('sortdirection')
        );
    }

    public function test_get_all_brands()
    {
        // Setup mock expectations
        $this->mockBrandService->shouldReceive('getAllBrands')
            ->once()
            ->andReturn($this->testBrands);
        
        // Test the endpoint
        $response = $this->get('/brands/getallbrands');
        
        // Assertions
        $response->assertStatus(200);
        $response->assertJsonCount(count($this->testBrands));
    }

    public function test_show_brand()
    {
        $brand = $this->testBrands->first();
        
        // Setup mock expectations
        $this->mockBrandService->shouldReceive('getBrandById')
            ->once()
            ->with($brand->id)
            ->andReturn($brand);
        
        // Make request as admin
        $response = $this->actingAs($this->admin)->get("/brands/{$brand->id}");
        
        // Assertions
        $response->assertStatus(200);
        $response->assertJson($brand->toArray());
    }

    public function test_store_brand()
    {
        // Prepare test data
        $newBrandData = [
            'name' => 'New Test Brand',
            'description' => 'A new brand for testing'
        ];
        
        $createdBrand = Brand::make($newBrandData);
        $createdBrand->id = 999;
        
        // Setup mock expectations
        $this->mockBrandService->shouldReceive('createBrand')
            ->once()
            ->with(Mockery::type('array'))
            ->andReturn($createdBrand);
        
        // Make request as admin
        $response = $this->actingAs($this->admin)->postJson('/brands', $newBrandData);
        
        // Assertions
        $response->assertStatus(201);
        $response->assertJson($createdBrand->toArray());
        $response->assertHeader('X-Message', 'Brand created successfully');
    }

    public function test_update_brand()
    {
        $brand = $this->testBrands->first();
        
        // Prepare update data
        $updateData = [
            'name' => 'Updated Brand Name',
            'description' => 'Updated brand description'
        ];
        
        $updatedBrand = Brand::make(array_merge(['id' => $brand->id], $updateData));
        
        // Setup mock expectations
        $this->mockBrandService->shouldReceive('updateBrand')
            ->once()
            ->with($brand->id, Mockery::type('array'))
            ->andReturn($updatedBrand);
        
        // Make request as admin
        $response = $this->actingAs($this->admin)->putJson("/brands/{$brand->id}", $updateData);
        
        // Assertions
        $response->assertStatus(200);
        $response->assertJson($updatedBrand->toArray());
    }

    public function test_delete_brand()
    {
        $brand = $this->testBrands->first();
        
        // Setup mock expectations
        $this->mockBrandService->shouldReceive('deleteBrand')
            ->once()
            ->with($brand->id)
            ->andReturn(true);
        
        // Make request as admin
        $response = $this->actingAs($this->admin)->deleteJson("/brands/{$brand->id}");
        
        // Assertions
        $response->assertStatus(204);
        $response->assertHeader('X-Message', 'Brand deleted successfully');
    }

    public function test_brand_store_validates_request_data()
    {
        // Prepare invalid data (empty name)
        $invalidData = [
            'description' => 'A brand without a name'
        ];
        
        // Make request as admin
        $response = $this->actingAs($this->admin)->postJson('/brands', $invalidData);
        
        // Should fail validation
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_brand_update_validates_request_data()
    {
        $brand = $this->testBrands->first();
        
        // Prepare invalid data (empty name)
        $invalidData = [
            'name' => '' // Empty name should fail validation
        ];
        
        // Make request as admin
        $response = $this->actingAs($this->admin)->putJson("/brands/{$brand->id}", $invalidData);
        
        // Should fail validation
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    public function test_non_admin_cannot_create_brand()
    {
        // Prepare brand data
        $brandData = [
            'name' => 'Test Brand',
            'description' => 'Brand created by non-admin'
        ];
        
        // Make request as regular user
        $response = $this->actingAs($this->user)->postJson('/brands', $brandData);
        
        // Should be forbidden
        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_update_brand()
    {
        $brand = $this->testBrands->first();
        
        // Prepare update data
        $updateData = [
            'name' => 'Updated by non-admin',
            'description' => 'This update should fail'
        ];
        
        // Make request as regular user
        $response = $this->actingAs($this->user)->putJson("/brands/{$brand->id}", $updateData);
        
        // Should be forbidden
        $response->assertStatus(403);
    }

    public function test_non_admin_cannot_delete_brand()
    {
        $brand = $this->testBrands->first();
        
        // Make request as regular user
        $response = $this->actingAs($this->user)->deleteJson("/brands/{$brand->id}");
        
        // Should be forbidden
        $response->assertStatus(403);
    }
}