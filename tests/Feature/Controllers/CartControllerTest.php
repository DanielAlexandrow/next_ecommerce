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
use Mockery;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CartControllerTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Brand $brand;
    protected Product $product;
    protected Subproduct $subproduct;
    protected Cart $cart;
    protected $mockCartService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create mock cart service
        $this->mockCartService = Mockery::mock(CartService::class);
        $this->app->instance(CartService::class, $this->mockCartService);
        
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
        ]);

        // Create cart for authenticated user
        $this->cart = Cart::factory()->create([
            'user_id' => $this->user->id
        ]);
    }

    public function test_guest_can_view_cart()
    {
        $response = $this->get('/cart');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('store/CartPage')
            ->has('cartitems')
            ->has('sessionId')
        );
    }

    public function test_authenticated_user_can_view_cart()
    {
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
        
        $this->mockCartService->shouldReceive('getCartItems')
            ->once()
            ->with($this->user->id)
            ->andReturn($mockCartItems);
        
        $response = $this->actingAs($this->user)->get('/cart');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('store/CartPage')
            ->has('cartitems')
            ->has('sessionId')
        );
    }


    public function test_guest_can_add_item_to_cart()
    {
        $response = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('cart_items', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);
        $response->assertJsonStructure([
            '*' => [
                'id',
                'quantity',
                'subproduct' => [
                    'id',
                    'name',
                    'price',
                    'product' => [
                        'name',
                        'images'
                    ]
                ]
            ]
        ]);
        $response->assertHeader('X-Message', 'Added to cart');
    }

    public function test_authenticated_user_can_add_item_to_cart()
    {
        $response = $this->actingAs($this->user)->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('cart_items', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2,
            'cart_id' => $this->cart->id
        ]);
    }

    public function test_cannot_add_unavailable_item_to_cart()
    {
        $this->subproduct->update(['available' => false]);

        $response = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);

        $response->assertStatus(422);
    }

    public function test_cannot_add_out_of_stock_item_to_cart()
    {
        $this->subproduct->update(['stock' => 1]);

        $response = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);

        $response->assertStatus(422);
    }

    public function test_can_remove_item_from_cart()
    {
        // First add item to cart
        CartItem::create([
            'cart_id' => $this->cart->id,
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);

        $response = $this->actingAs($this->user)->postJson('/cart/remove', [
            'subproduct_id' => $this->subproduct->id
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseMissing('cart_items', [
            'cart_id' => $this->cart->id,
            'subproduct_id' => $this->subproduct->id
        ]);
    }

    public function test_can_get_cart_items()
    {
        // Add items to cart
        CartItem::create([
            'cart_id' => $this->cart->id,
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);

        $response = $this->actingAs($this->user)->getJson('/getcartitems');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'id',
                'quantity',
                'subproduct' => [
                    'id',
                    'name',
                    'price',
                    'product' => [
                        'name',
                        'images'
                    ]
                ]
            ]
        ]);
    }

    public function test_cart_persists_between_guest_and_authenticated_sessions()
    {
        // Add item as guest
        $guestResponse = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);
        
        $sessionId = $guestResponse->headers->get('X-Session-Id');
        
        // Login and verify items are transferred
        $this->actingAs($this->user);
        
        $response = $this->getJson('/getcartitems');
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        
        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $this->cart->id,
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);
    }
}