<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\CheckoutService;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Subproduct;
use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class CheckoutServiceTest extends TestCase {
    use RefreshDatabase;

    private CheckoutService $checkoutService;
    private User $user;
    private Cart $cart;
    private Product $product;
    private Subproduct $subproduct;

    protected function setUp(): void {
        parent::setUp();
        $this->checkoutService = app(CheckoutService::class);

        // Create test user
        $this->user = User::factory()->create();

        // Create test product and subproduct
        $this->product = Product::factory()->create([
            'name' => 'Test Product'
        ]);

        $this->subproduct = $this->product->subproducts()->save(
            Subproduct::factory()->make([
                'name' => 'Test Variant',
                'price' => 100.00,
                'stock' => 5
            ])
        );

        // Create cart and add item
        $this->cart = Cart::create([
            'user_id' => $this->user->id
        ]);

        CartItem::create([
            'cart_id' => $this->cart->id,
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);
    }

    public function test_process_checkout_with_invalid_cart_id() {
        // Act & Assert
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
        $this->checkoutService->processCheckout(999, [
            'shipping_address' => ['address' => '123 Main St'],
            'billing_address' => ['address' => '123 Main St']
        ]);
    }

    public function test_process_checkout_for_authenticated_user() {
        // Arrange
        $this->actingAs($this->user);
        $initialStock = $this->subproduct->stock;
        $expectedTotal = $this->subproduct->price * 2; // 2 is the quantity from setUp

        // Act
        $order = $this->checkoutService->processCheckout($this->cart->id, [
            'adressData' => [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'address' => '123 Main St',
                'postal_code' => '12345',
                'city' => 'Test City',
                'country' => 'Test Country',
                'phone' => '1234567890'
            ]
        ]);

        // Assert
        $this->assertInstanceOf(Order::class, $order);
        $this->assertEquals($this->user->id, $order->user_id);
        $this->assertEquals($expectedTotal, $order->total);
        $this->assertEquals('pending', $order->status);

        // Check stock was updated
        $this->subproduct->refresh();
        $this->assertEquals($initialStock - 2, $this->subproduct->stock);

        // Check cart was cleared
        $this->assertDatabaseMissing('carts', ['id' => $this->cart->id]);
        $this->assertDatabaseMissing('cart_items', ['cart_id' => $this->cart->id]);

        // Check order items
        $orderItems = json_decode($order->items, true);
        $this->assertCount(1, $orderItems);
        $this->assertEquals($this->product->id, $orderItems[0]['product_id']);
        $this->assertEquals($this->subproduct->id, $orderItems[0]['subproduct_id']);
        $this->assertEquals(2, $orderItems[0]['quantity']);
        $this->assertEquals($this->subproduct->price, $orderItems[0]['price']);
        $this->assertEquals($this->product->name, $orderItems[0]['name']);
        $this->assertEquals($this->subproduct->name, $orderItems[0]['variant']);
    }
}
