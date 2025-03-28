<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Order;
use App\Models\User;
use App\Models\Guest;
use App\Models\Product;
use App\Models\Subproduct;
use App\Models\OrderItem;
use App\Models\AddressInfo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Helpers\WithPermissions;

class AdminOrdersTest extends TestCase {
    use RefreshDatabase;
    use WithPermissions;

    protected User $admin;
    protected Order $order;
    protected Guest $guest;

    protected function setUp(): void {
        parent::setUp();
        
        // Set up permissions
        $this->setUpPermissions();
        
        // Create admin
        $this->admin = User::factory()->create(['role' => 'admin']);
        
        // Create address info first - using 'street' instead of 'address'
        $addressInfo = AddressInfo::create([
            'name' => 'John Doe',
            'street' => '123 Test St', // Changed from 'address' to 'street'
            'city' => 'Test City',
            'postal_code' => '12345',
            'country' => 'Test Country',
            'phone' => '123-456-7890'
        ]);
        
        // Create guest with address info
        $this->guest = Guest::create([
            'id_address_info' => $addressInfo->id,
            'email' => 'guest@example.com',
            'phone' => '123-456-7890'
        ]);

        // Create a test product
        $product = Product::factory()->create([
            'name' => 'Test Product'
        ]);

        $subproduct = Subproduct::factory()->create([
            'name' => 'Test Variant',
            'price' => 99.99,
            'product_id' => $product->id
        ]);

        // Create test order
        $this->order = Order::create([
            'guest_id' => $this->guest->id,
            'total' => 99.99,
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'items' => json_encode([
                [
                    'id' => $subproduct->id,
                    'name' => $product->name,
                    'variant' => $subproduct->name,
                    'quantity' => 1,
                    'price' => $subproduct->price
                ]
            ])
        ]);

        // Create order item
        OrderItem::create([
            'order_id' => $this->order->id,
            'subproduct_id' => $subproduct->id,
            'quantity' => 1,
            'price' => $subproduct->price
        ]);
    }

    public function test_admin_can_view_orders() {
        $response = $this->actingAs($this->admin)
            ->get('/orders');

        $response->assertStatus(200)
            ->assertInertia(fn ($page) => $page
                ->component('admin/Orders')
                ->has('orders.data', 1)
                ->has('sortkey')
                ->has('sortdirection')
                ->has('search')
            );
    }

    public function test_admin_can_update_order_status() {
        $response = $this->actingAs($this->admin)
            ->putJson("/orders/{$this->order->id}/status", [
                'status' => 'processing',
                'payment_status' => 'paid',
                'shipping_status' => 'shipped'
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'processing',
            'payment_status' => 'paid',
            'shipping_status' => 'shipped'
        ]);
    }

    public function test_admin_can_view_order_details() {
        $response = $this->actingAs($this->admin)
            ->getJson("/orders/getitems/{$this->order->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'order',
                'customer',
                'items',
                'total',
                'status'
            ]);
    }

    public function test_non_admin_cannot_access_orders() {
        $user = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($user)
            ->get('/orders');

        $response->assertStatus(403);
    }

    public function test_admin_can_generate_order_pdf() {
        $response = $this->actingAs($this->admin)
            ->get("/orders/generatepdf/{$this->order->id}");

        $response->assertStatus(200)
            ->assertHeader('content-type', 'application/pdf');
    }
}
