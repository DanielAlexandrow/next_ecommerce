<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Subproduct;
use App\Models\User;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\AddressInfo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartCheckoutTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $product;
    protected $subproduct;
    protected $secondSubproduct;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test data - products, subproducts, etc.
        $this->seedTestData();
    }

    protected function seedTestData()
    {
        // Create an address for the user
        $addressInfo = AddressInfo::create([
            'name' => 'Test User',
            'email' => 'test-user@example.com',
            'postal_code' => '12345', // Changed from postcode to postal_code
            'city' => 'Test City',
            'country' => 'Test Country',
            'street' => '123 Test St',
            'phone' => '1234567890', // Added missing phone field
        ]);

        // Create a test user with address info
        $this->user = User::factory()->create([
            'email' => 'test-user@example.com',
            'password' => bcrypt('password'),
            'id_address_info' => $addressInfo->id,
        ]);

        // Create a test product
        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'description' => 'This is a test product',
            'available' => true,
        ]);

        // Create a test subproduct for the product
        $this->subproduct = Subproduct::factory()->create([
            'product_id' => $this->product->id,
            'name' => 'Standard',
            'price' => 99.99,
            'available' => true,
            'stock' => 10
        ]);

        // Create a second subproduct for testing multiple items
        $this->secondSubproduct = Subproduct::factory()->create([
            'product_id' => $this->product->id,
            'name' => 'Premium',
            'price' => 149.99,
            'available' => true,
            'stock' => 5
        ]);
    }

    public function test_guest_can_add_item_to_cart()
    {
        // Add item to cart
        $response = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);

        // Check response
        $response->assertStatus(201);
        $response->assertJsonStructure([
            '*' => [
                'id',
                'cart_id',
                'subproduct_id',
                'quantity',
                'subproduct' => [
                    'id',
                    'name',
                    'price',
                    'product' => [
                        'id',
                        'name',
                        'images'
                    ]
                ]
            ]
        ]);

        // Verify cart in database
        $this->assertDatabaseHas('cart_items', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);
    }

    public function test_user_can_add_item_to_cart()
    {
        // Acting as authenticated user
        $this->actingAs($this->user);

        // Add item to cart
        $response = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);

        // Check response
        $response->assertStatus(201);

        // Verify cart in database
        $this->assertDatabaseHas('cart_items', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);

        // Verify cart is associated with the user
        $this->assertDatabaseHas('carts', [
            'user_id' => $this->user->id
        ]);
    }

    public function test_can_remove_item_from_cart()
    {
        // Setup: First add an item to the cart
        $response = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);
        
        // Verify the item was actually added successfully
        $response->assertStatus(201);
        $this->assertDatabaseHas('cart_items', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);
        
        // Get the cart item that was added
        $cartItem = CartItem::where('subproduct_id', $this->subproduct->id)->firstOrFail();
        $cartItemId = $cartItem->id;
        
        // Now remove the item
        $response = $this->postJson('/cart/remove', [
            'subproduct_id' => $this->subproduct->id
        ]);
        
        // Check response
        $response->assertStatus(201);
        
        // Verify the quantity was decremented
        $cartItem->refresh();
        $this->assertEquals(1, $cartItem->quantity);
        
        // Remove again to verify complete removal
        $response = $this->postJson('/cart/remove', [
            'subproduct_id' => $this->subproduct->id
        ]);
        
        // Verify the item is completely removed
        $this->assertDatabaseMissing('cart_items', [
            'id' => $cartItemId
        ]);
    }

    public function test_guest_checkout_process()
    {
        // Setup: Add an item to cart
        $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);

        // Get the cart that was created
        $cart = Cart::first();
        $this->assertNotNull($cart);

        // Perform checkout with all required address fields
        $addressData = [
            'name' => 'Test User',
            'email' => 'checkout-test@example.com',
            'phone' => '1234567890',
            'address' => '123 Test St',
            'postal_code' => '12345',
            'city' => 'Test City',
            'country' => 'Test Country'
        ];

        $response = $this->postJson("/checkout/{$cart->id}", [
            'adressData' => $addressData,
            'cart_id' => $cart->id
        ]);

        // Check response
        $response->assertStatus(200);
        $response->assertJsonStructure(['order']);

        // Verify order was created
        $this->assertDatabaseHas('orders', [
            'total' => 99.99  // The price of our subproduct
        ]);

        // Verify cart was removed
        $this->assertDatabaseMissing('carts', [
            'id' => $cart->id
        ]);

        // Verify the stock was updated
        $this->subproduct->refresh();
        $this->assertEquals(9, $this->subproduct->stock);
    }

    public function test_user_checkout_process()
    {
        // Acting as authenticated user
        $this->actingAs($this->user);

        // Setup: Add an item to cart
        $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);

        // Get the cart that was created for this user
        $cart = Cart::where('user_id', $this->user->id)->first();
        $this->assertNotNull($cart);

        // For authenticated users, we just need the cart_id
        $response = $this->postJson("/checkout/{$cart->id}", [
            'cart_id' => $cart->id
        ]);

        // Check response
        $response->assertStatus(200);
        $response->assertJsonStructure(['order']);

        // Verify order was created with user association
        $this->assertDatabaseHas('orders', [
            'user_id' => $this->user->id,
            'total' => 99.99
        ]);

        // Verify cart was removed
        $this->assertDatabaseMissing('carts', [
            'id' => $cart->id
        ]);
        
        // Verify the stock was updated
        $this->subproduct->refresh();
        $this->assertEquals(9, $this->subproduct->stock);
    }

    public function test_can_add_multiple_different_items_to_cart()
    {
        // Add first item
        $response1 = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);
        
        // Add second item
        $response2 = $this->postJson('/cart/add', [
            'subproduct_id' => $this->secondSubproduct->id,
            'quantity' => 2
        ]);

        // Check responses
        $response1->assertStatus(201);
        $response2->assertStatus(201);

        // Verify both items in database
        $this->assertDatabaseHas('cart_items', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);
        $this->assertDatabaseHas('cart_items', [
            'subproduct_id' => $this->secondSubproduct->id,
            'quantity' => 2
        ]);

        // Verify total items in cart
        $cart = Cart::first();
        $this->assertEquals(2, $cart->cartItems()->count());
    }

    public function test_cannot_add_out_of_stock_items()
    {
        // Set stock to 0
        $this->subproduct->update(['stock' => 0]);

        // Try to add out of stock item
        $response = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);

        // Check response
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['subproduct_id']);

        // Verify no cart item was created
        $this->assertDatabaseMissing('cart_items', [
            'subproduct_id' => $this->subproduct->id
        ]);
    }

    public function test_cannot_add_more_than_available_stock()
    {
        // Try to add more than available stock
        $response = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 11
        ]);

        // Check response
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['quantity']);
    }

    public function test_cart_persists_for_guest_across_sessions()
    {
        // Add item to cart
        $response = $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);

        // Get session ID from first request
        $sessionId = $response->headers->get('X-Session-Id');
        $this->assertNotNull($sessionId);

        // Make new request with same session ID
        $this->withHeader('X-Session-Id', $sessionId);
        $response = $this->getJson('/getcartitems');

        // Verify cart items are still present
        $response->assertStatus(200);
        $response->assertJsonCount(1);
        $response->assertJsonFragment([
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);
    }

    public function test_guest_cart_merges_when_user_logs_in()
    {
        // Add item to guest cart
        $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);

        // Add different item to user's existing cart
        $this->actingAs($this->user);
        $this->postJson('/cart/add', [
            'subproduct_id' => $this->secondSubproduct->id,
            'quantity' => 1
        ]);

        // Verify both items are in user's cart
        $userCart = Cart::where('user_id', $this->user->id)->first();
        $this->assertEquals(2, $userCart->cartItems()->count());
        $this->assertTrue($userCart->cartItems()->where('subproduct_id', $this->subproduct->id)->exists());
        $this->assertTrue($userCart->cartItems()->where('subproduct_id', $this->secondSubproduct->id)->exists());
    }

    public function test_checkout_fails_with_invalid_address()
    {
        // Add item to cart
        $this->postJson('/cart/add', [
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);

        $cart = Cart::first();

        // Try checkout with missing required fields
        $response = $this->postJson("/checkout/{$cart->id}", [
            'adressData' => [
                'name' => 'Test User',
                // missing email and other required fields
            ],
            'cart_id' => $cart->id
        ]);

        // Check response
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['adressData.email', 'adressData.phone', 'adressData.address', 
            'adressData.postal_code', 'adressData.city', 'adressData.country']);

        // Verify cart still exists
        $this->assertDatabaseHas('carts', ['id' => $cart->id]);
    }

    public function test_checkout_fails_with_empty_cart()
    {
        // Create empty cart
        $cart = Cart::create(['user_id' => $this->user->id]);

        // Try checkout
        $response = $this->actingAs($this->user)
            ->postJson("/checkout/{$cart->id}", [
                'cart_id' => $cart->id
            ]);

        // Check response
        $response->assertStatus(422);
        $response->assertJson([
            'message' => 'Cart is empty'
        ]);
    }
}