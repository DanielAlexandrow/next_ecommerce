<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Deal;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Services\DealService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\Helpers\TestHelpers;

class DealControllerTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    protected $admin;
    protected $user;
    protected $mockDealService;
    protected $product;
    protected $category;
    protected $brand;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Use our helper methods to create users
        $this->admin = $this->createAdmin();
        $this->user = $this->createUser();
        
        $this->product = Product::factory()->create();
        $this->category = Category::factory()->create();
        $this->brand = Brand::factory()->create();
        
        $this->mockDealService = $this->mock(DealService::class);
    }

    public function test_index_requires_admin()
    {
        // Test unauthenticated with JSON request
        $response = $this->getJson('/admin/deals');
        $response->assertStatus(401); // Unauthenticated requests should return 401
        
        // Test unauthorized user with JSON request
        $response = $this->actingAs($this->user)->getJson('/admin/deals');
        $response->assertStatus(403); // Non-admin authenticated users should get 403
    }

    public function test_admin_can_view_deals()
    {
        // Create a collection of deals
        $deals = collect([
            Deal::factory()->create([
                'name' => 'Test Deal',
                'discount_amount' => 10.00,
                'active' => true
            ])
        ]);

        // Use our helper method to paginate the collection
        $paginatedDeals = $this->paginateQuery($deals);
        
        $this->mockDealService->shouldReceive('getDeals')
            ->once()
            ->with(Mockery::type('array'))
            ->andReturn($paginatedDeals);
        
        $response = $this->actingAs($this->admin)->get('/admin/deals');
        $response->assertStatus(200);
    }

    public function test_store_creates_deal()
    {
        $dealData = [
            'name' => 'New Deal',
            'description' => 'Test Description',
            'discount_amount' => 10.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now()->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(7)->format('Y-m-d'),
            'active' => true,
            'deal_type' => 'product',
            'product_ids' => [$this->product->id]
        ];

        $createdDeal = new Deal($dealData);
        $createdDeal->id = 1;
        
        $this->mockDealService->shouldReceive('createDeal')
            ->once()
            ->with(Mockery::type('array'))
            ->andReturn($createdDeal);
        
        $response = $this->actingAs($this->admin)
            ->postJson('/api/deals', $dealData);
        
        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Deal created successfully',
                'deal' => $createdDeal->toArray()
            ]);
    }

    public function test_update_modifies_deal()
    {
        $deal = Deal::create([
            'name' => 'Original Deal',
            'discount_amount' => 10.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'product'
        ]);

        $updateData = [
            'name' => 'Updated Deal',
            'description' => 'Updated Description',
            'discount_amount' => 20.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now()->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(14)->format('Y-m-d'),
            'active' => true,
            'deal_type' => 'product',
            'product_ids' => [$this->product->id]
        ];

        $updatedDeal = new Deal($updateData);
        $updatedDeal->id = $deal->id;

        $this->mockDealService->shouldReceive('updateDeal')
            ->once()
            ->with(Mockery::type(Deal::class), Mockery::type('array'))
            ->andReturn($updatedDeal);
        
        $response = $this->actingAs($this->admin)
            ->putJson("/api/deals/{$deal->id}", $updateData);
        
        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Deal updated successfully',
                'deal' => $updatedDeal->toArray()
            ]);
    }

    public function test_destroy_deletes_deal()
    {
        $deal = Deal::create([
            'name' => 'Test Deal',
            'discount_amount' => 10.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'product'
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/deals/{$deal->id}");
        
        $response->assertStatus(204);
        $this->assertDatabaseMissing('deals', ['id' => $deal->id]);
    }

    public function test_validates_deal_creation()
    {
        $invalidData = [
            'name' => '',
            'discount_amount' => 'invalid',
            'discount_type' => 'invalid',
            'deal_type' => 'invalid',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/deals', $invalidData);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'name',
                'discount_amount',
                'discount_type',
                'deal_type',
                'start_date',
                'end_date'
            ]);
    }

    public function test_validates_deal_type_specific_fields()
    {
        $dealData = [
            'name' => 'Test Deal',
            'discount_amount' => 10.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now()->format('Y-m-d'),
            'end_date' => Carbon::now()->addDays(7)->format('Y-m-d'),
            'active' => true,
            'deal_type' => 'product',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/deals', $dealData);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['product_ids']);
    }
}