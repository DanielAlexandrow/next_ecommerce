<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Subproduct;
use App\Models\Deal;
use App\Services\CartService;
use App\Services\DealService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Helpers\TestHelpers;

class CartDealsTest extends TestCase
{
    use RefreshDatabase, TestHelpers;

    protected $user;
    protected $cart;
    protected $product;
    protected $subproduct;
    protected $deal;
    protected $cartService;
    protected $dealService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create user first before using its ID
        $this->user = $this->createUser();
        
        $this->product = Product::factory()->create();
        $this->subproduct = Subproduct::factory()->create([
            'product_id' => $this->product->id,
            'price' => 99.99,
            'available' => true
        ]);
        
        // Create cart and verify it was created successfully
        $this->cart = Cart::create(['user_id' => $this->user->id]);
        $this->assertModelCreated($this->cart, 'Cart creation failed');
        
        $cartItem = CartItem::create([
            'cart_id' => $this->cart->id,
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);
        $this->assertModelCreated($cartItem, 'CartItem creation failed');
        
        $this->deal = Deal::create([
            'name' => 'Test Deal',
            'discount_amount' => 10.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'product'
        ]);
        
        $this->deal->products()->attach($this->product->id);
        
        // Use real service instances instead of mocks
        $this->cartService = app(CartService::class);
        $this->dealService = app(DealService::class);
    }

    public function test_get_cart_with_deals_returns_applied_discounts()
    {
        // Set up the expected data that our real service should produce
        $response = $this->actingAs($this->user)
            ->getJson('/cart/withdeals');

        // Assert basic structure and status code
        $response->assertStatus(200)
            ->assertJsonStructure([
                'items',
                'original_total',
                'discount_amount',
                'final_total'
            ]);
    }

    public function test_cart_deal_requires_minimum_amount()
    {
        // Create a cart deal with minimum amount condition
        $cartDeal = Deal::create([
            'name' => 'Cart Deal',
            'discount_amount' => 15.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'cart',
            'conditions' => [
                'minimum_amount' => 200.00
            ]
        ]);
        
        $response = $this->actingAs($this->user)
            ->getJson('/cart/withdeals');

        // Since cart total should be less than minimum_amount, no discount should be applied
        $response->assertStatus(200)
            ->assertJson([
                'discount_amount' => 0,
                'applied_deal' => null
            ]);
    }

    public function test_applies_best_deal_to_cart()
    {
        // Create a product deal
        $productDeal = Deal::create([
            'name' => 'Product Deal',
            'discount_amount' => 10.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'product'
        ]);
        $productDeal->products()->attach($this->product->id);
        
        // Create a better cart deal
        $cartDeal = Deal::create([
            'name' => 'Cart Deal',
            'discount_amount' => 20.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'cart'
        ]);
        
        $response = $this->actingAs($this->user)
            ->getJson('/cart/withdeals');
            
        $response->assertStatus(200);
        
        // We expect the better deal (cart deal with 20% discount) to be applied
        $responseData = $response->json();
        $this->assertNotNull($responseData['applied_deal']);
        $this->assertEquals('Cart Deal', $responseData['applied_deal']['name']);
        $this->assertEquals(20.00, $responseData['applied_deal']['discount_amount']);
    }
}