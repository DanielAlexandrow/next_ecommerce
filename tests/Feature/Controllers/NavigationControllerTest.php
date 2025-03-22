<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Header;
use App\Models\NavigationItem;
use App\Models\Category;
use App\Interfaces\NavigationServiceInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class NavigationControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $user;
    protected $mockNavService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test users
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->user = User::factory()->create(['role' => 'customer']);
        
        // Create test headers and navigation items
        $this->createTestNavigationStructure();
        
        // Mock the navigation service
        $this->mockNavService = Mockery::mock(NavigationServiceInterface::class);
        $this->app->instance(NavigationServiceInterface::class, $this->mockNavService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    protected function createTestNavigationStructure()
    {
        // Create headers
        $header1 = Header::create(['name' => 'Main Menu', 'order_num' => 1]);
        $header2 = Header::create(['name' => 'Footer', 'order_num' => 2]);
        
        // Create navigation items
        $navItem1 = NavigationItem::create(['name' => 'Products', 'order_num' => 1, 'header_id' => $header1->id]);
        $navItem2 = NavigationItem::create(['name' => 'About', 'order_num' => 2, 'header_id' => $header1->id]);
        
        // Create categories with slugs
        $category1 = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics'
        ]);
        $category2 = Category::create([
            'name' => 'Clothing',
            'slug' => 'clothing'
        ]);
        
        // Link categories to navigation items
        $navItem1->categories()->attach($category1->id, ['description' => 'Electronic products']);
        $navItem1->categories()->attach($category2->id, ['description' => 'Clothing products']);
    }

    public function test_index_page_requires_admin_authentication()
    {
        // Act as unauthenticated user
        $response = $this->get('/navigation');
        
        // Assert that we're redirected to login
        $response->assertStatus(302);
        $response->assertRedirect('/adminlogin');
        
        // Act as authenticated non-admin user
        $response = $this->actingAs($this->user)->get('/navigation');
        
        // Assert that access is forbidden
        $response->assertStatus(403);
    }

    public function test_admin_can_access_navigation_index()
    {
        // Set up mock service expectations
        $expectedData = [
            ['id' => 1, 'name' => 'Main Menu', 'navigation_items' => [/* ... */]],
            ['id' => 2, 'name' => 'Footer', 'navigation_items' => [/* ... */]],
        ];
        
        $this->mockNavService->shouldReceive('getNavigationData')
            ->once()
            ->andReturn($expectedData);
        
        // Act as admin
        $response = $this->actingAs($this->admin)->get('/navigation');
        
        // Assert response
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/NavigationMaker')
            ->has('headers')
        );
    }

    public function test_get_navigation_data()
    {
        // Setup mock
        $expectedData = [
            ['id' => 1, 'name' => 'Main Menu', 'navigation_items' => [/* ... */]],
            ['id' => 2, 'name' => 'Footer', 'navigation_items' => [/* ... */]],
        ];
        
        $this->mockNavService->shouldReceive('getNavigationData')
            ->once()
            ->andReturn($expectedData);
        
        // Make the request
        $response = $this->get('/navigation/getnavdata');
        
        // Assertions
        $response->assertStatus(200);
        $response->assertJson($expectedData);
    }

    public function test_update_navigation()
    {
        // Setup mock
        $expectedData = [
            ['id' => 1, 'name' => 'Updated Main Menu', 'navigation_items' => [/* ... */]],
            ['id' => 2, 'name' => 'Updated Footer', 'navigation_items' => [/* ... */]],
        ];
        
        $this->mockNavService->shouldReceive('syncNavigation')
            ->once()
            ->andReturn($expectedData);
        
        // Prepare test data
        $updateData = [
            'headers' => [
                [
                    'id' => 1,
                    'name' => 'Updated Main Menu',
                    'navigation_items' => [
                        [
                            'id' => 1, 
                            'name' => 'Updated Products',
                            'categories' => [1, 2]
                        ]
                    ]
                ]
            ]
        ];
        
        // Make the request as admin
        $response = $this->actingAs($this->admin)->putJson('/navigation', $updateData);
        
        // Assertions
        $response->assertStatus(200);
        $response->assertJson($expectedData);
    }

    public function test_update_requires_authentication()
    {
        $updateData = ['headers' => []];
        
        // Unauthenticated
        $response = $this->putJson('/navigation', $updateData);
        $response->assertStatus(401);
        
        // Non-admin
        $response = $this->actingAs($this->user)->putJson('/navigation', $updateData);
        $response->assertStatus(403);
    }

    public function test_update_validates_request_data()
    {
        // Invalid data (missing headers)
        $invalidData = [];
        
        // Make request as admin
        $response = $this->actingAs($this->admin)->putJson('/navigation', $invalidData);
        
        // Should fail validation
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['headers']);
    }
}