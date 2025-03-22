<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Subproduct;
use App\Services\CartService;
use Illuminate\Support\Facades\Session;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

class CartControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $brand;
    protected $product;
    protected $subproduct;
    protected $mockCartService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test user
        $this->user = User::factory()->create(['role' => 'customer']);
        
        // Create test brand and product
        $this->brand = Brand::factory()->create(['name' => 'Test Brand']);
        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'description' => 'Test product description',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);
        
        // Create test subproduct
        $this->subproduct = Subproduct::factory()->create([
            'name' => 'Test Variant',
            'price' => 99.99,
            'stock' => 10,
            'available' => true,
            'product_id' => $this->product->id,
            'sku' => 'TEST-SKU-001'
        ]);
        
        // Mock the cart service
        $this->mockCartService = Mockery::mock(CartService::class);
        $this->app->instance(CartService::class, $this->mockCartService);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_can_view_cart_page()
    {
        // Setup mock cart items
        $mockCartItems = [
            [
                'id' => 1,
                'quantity' => 2,
                'subproduct' => [
                    'id' => $this->subproduct->id,
                    'name' => $this->subproduct->name,
                    'price' => $this->subproduct->price,
                    'product' => [
                        'name' => $this->product->name,
                        'images' => []
                    ]
                ]
            ]
        ];
        
        // Set mock expectations
        $this->mockCartService->shouldReceive('getCartItems')
            ->once()
            ->with(null)  // No user ID for unauthenticated request
            ->andReturn($mockCartItems);
        
        // Make request
        $response = $this->get('/cart');
        
        // Assert response
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Cart/Index')
            ->has('cartitems')
            ->has('sessionId')
        );
    }

    public function test_authenticated_user_can_view_cart()
    {
        // Setup mock cart items
        $mockCartItems = [
            [
                'id' => 1,
                'quantity' => 2,
                'subproduct' => [
                    'id' => $this->subproduct->id,
                    'name' => $this->subproduct->name,
                    'price' => $this->subproduct->price,
                    'product' => [
                        'name' => $this->product->name,
                        'images' => []
                    ]
                ]
            ]
        ];
        
        // Set mock expectations
        $this->mockCartService->shouldReceive('getCartItems')
            ->once()
            ->with($this->user->id)  // User ID for authenticated request
            ->andReturn($mockCartItems);
        
        // Make request as authenticated user
        $response = $this->actingAs($this->user)->get('/cart');
        
        // Assert response
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Cart/Index')
            ->has('cartitems')
            ->has('sessionId')
        );
    }

    public function test_can_add_item_to_cart()
    {
        // Prepare test data
        $cartData = [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ];
        
        // Setup mock cart items after addition
        $mockCartItems = [
            [
                'id' => 1,
                'quantity' => 2,
                'subproduct' => [
                    'id' => $this->subproduct->id,
                    'name' => $this->subproduct->name,
                    'price' => $this->subproduct->price,
                    'product' => [
                        'name' => $this->product->name
                    ]
                ]
            ]
        ];
        
        // Set mock expectations
        $this->mockCartService->shouldReceive('addOrIncrementCartItem')
            ->once()
            ->with($this->subproduct->id, null, 2)
            ->andReturn($mockCartItems);
        
        // Make request
        $response = $this->postJson('/cart/add', $cartData);
        
        // Assert response
        $response->assertStatus(201);
        $response->assertJson($mockCartItems);
        $response->assertHeader('X-Message', 'Added to cart');
    }

    public function test_authenticated_user_can_add_item_to_cart()
    {
        // Prepare test data
        $cartData = [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ];
        
        // Setup mock cart items after addition
        $mockCartItems = [
            [
                'id' => 1,
                'quantity' => 2,
                'subproduct' => [
                    'id' => $this->subproduct->id,
                    'name' => $this->subproduct->name,
                    'price' => $this->subproduct->price,
                    'product' => [
                        'name' => $this->product->name
                    ]
                ]
            ]
        ];
        
        // Set mock expectations
        $this->mockCartService->shouldReceive('addOrIncrementCartItem')
            ->once()
            ->with($this->subproduct->id, $this->user->id, 2)
            ->andReturn($mockCartItems);
        
        // Make request as authenticated user
        $response = $this->actingAs($this->user)->postJson('/cart/add', $cartData);
        
        // Assert response
        $response->assertStatus(201);
        $response->assertJson($mockCartItems);
        $response->assertHeader('X-Message', 'Added to cart');
    }

    public function test_cannot_add_unavailable_item_to_cart()
    {
        // Create an unavailable subproduct
        $unavailableSubproduct = Subproduct::factory()->create([
            'name' => 'Unavailable Variant',
            'price' => 99.99,
            'stock' => 10,
            'available' => false,  // Not available
            'product_id' => $this->product->id,
            'sku' => 'TEST-SKU-002'
        ]);
        
        // Prepare test data
        $cartData = [
            'subproduct_id' => $unavailableSubproduct->id,
            'quantity' => 2
        ];
        
        // Make request
        $response = $this->postJson('/cart/add', $cartData);
        
        // Assert response
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['subproduct_id']);
    }

    public function test_cannot_add_out_of_stock_item_to_cart()
    {
        // Create a subproduct with insufficient stock
        $lowStockSubproduct = Subproduct::factory()->create([
            'name' => 'Low Stock Variant',
            'price' => 99.99,
            'stock' => 1,  // Only 1 in stock
            'available' => true,
            'product_id' => $this->product->id,
            'sku' => 'TEST-SKU-003'
        ]);
        
        // Prepare test data requesting more than available
        $cartData = [
            'subproduct_id' => $lowStockSubproduct->id,
            'quantity' => 5  // More than stock
        ];
        
        // Make request
        $response = $this->postJson('/cart/add', $cartData);
        
        // Assert response
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['subproduct_id']);
    }

    public function test_cart_validates_required_fields()
    {
        // Prepare invalid data (missing required fields)
        $invalidData = [
            // Missing subproduct_id and quantity
        ];
        
        // Make request
        $response = $this->postJson('/cart/add', $invalidData);
        
        // Assert response
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['subproduct_id', 'quantity']);
    }

    public function test_can_remove_item_from_cart()
    {
        // Prepare test data
        $cartData = [
            'subproduct_id' => $this->subproduct->id
        ];
        
        // Setup mock cart items after removal
        $mockCartItems = []; // Empty cart after removal
        
        // Set mock expectations
        $this->mockCartService->shouldReceive('removeOrDecrementCartItem')
            ->once()
            ->with($this->subproduct->id, null)
            ->andReturn($mockCartItems);
        
        // Make request
        $response = $this->postJson('/cart/remove', $cartData);
        
        // Assert response
        $response->assertStatus(201);
        $response->assertJson($mockCartItems);
    }

    public function test_authenticated_user_can_remove_item_from_cart()
    {
        // Prepare test data
        $cartData = [
            'subproduct_id' => $this->subproduct->id
        ];
        
        // Setup mock cart items after removal
        $mockCartItems = []; // Empty cart after removal
        
        // Set mock expectations
        $this->mockCartService->shouldReceive('removeOrDecrementCartItem')
            ->once()
            ->with($this->subproduct->id, $this->user->id)
            ->andReturn($mockCartItems);
        
        // Make request as authenticated user
        $response = $this->actingAs($this->user)->postJson('/cart/remove', $cartData);
        
        // Assert response
        $response->assertStatus(201);
        $response->assertJson($mockCartItems);
    }

    public function test_can_get_cart_items()
    {
        // Setup mock cart items
        $mockCartItems = [
            [
                'id' => 1,
                'quantity' => 2,
                'subproduct' => [
                    'id' => $this->subproduct->id,
                    'name' => $this->subproduct->name,
                    'price' => $this->subproduct->price,
                    'product' => [
                        'name' => $this->product->name,
                        'images' => []
                    ]
                ]
            ]
        ];
        
        // Set mock expectations
        $this->mockCartService->shouldReceive('getCartItems')
            ->once()
            ->with(null)
            ->andReturn($mockCartItems);
        
        // Make request
        $response = $this->getJson('/getcartitems');
        
        // Assert response
        $response->assertStatus(200);
        $response->assertJson($mockCartItems);
        $response->assertHeader('X-Session-Id');
    }

    public function test_authenticated_user_can_get_cart_items()
    {
        // Setup mock cart items
        $mockCartItems = [
            [
                'id' => 1,
                'quantity' => 2,
                'subproduct' => [
                    'id' => $this->subproduct->id,
                    'name' => $this->subproduct->name,
                    'price' => $this->subproduct->price,
                    'product' => [
                        'name' => $this->product->name,
                        'images' => []
                    ]
                ]
            ]
        ];
        
        // Set mock expectations
        $this->mockCartService->shouldReceive('getCartItems')
            ->once()
            ->with($this->user->id)
            ->andReturn($mockCartItems);
        
        // Make request as authenticated user
        $response = $this->actingAs($this->user)->getJson('/getcartitems');
        
        // Assert response
        $response->assertStatus(200);
        $response->assertJson($mockCartItems);
        $response->assertHeader('X-Session-Id');
    }
}