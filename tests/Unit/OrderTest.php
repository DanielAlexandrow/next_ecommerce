<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Guest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderTest extends TestCase {
    use RefreshDatabase;

    private Order $order;
    private User $user;
    private Guest $guest;

    protected function setUp(): void {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->guest = Guest::factory()->create();

        $this->order = Order::factory()->create([
            'user_id' => $this->user->id,
            'items' => [
                ['id' => 1, 'quantity' => 2, 'price' => 10.00],
                ['id' => 2, 'quantity' => 1, 'price' => 15.00]
            ],
            'total' => 35.00,
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'shipping_address' => [
                'street' => '123 Test St',
                'city' => 'Test City',
                'country' => 'Test Country'
            ],
            'billing_address' => [
                'street' => '123 Test St',
                'city' => 'Test City',
                'country' => 'Test Country'
            ]
        ]);
    }

    public function test_order_belongs_to_user() {
        $this->assertInstanceOf(User::class, $this->order->user);
        $this->assertEquals($this->user->id, $this->order->user->id);
    }

    public function test_order_can_belong_to_guest() {
        $guestOrder = Order::factory()->create([
            'guest_id' => $this->guest->id,
            'user_id' => null
        ]);

        $this->assertInstanceOf(Guest::class, $guestOrder->guest);
        $this->assertEquals($this->guest->id, $guestOrder->guest->id);
    }

    public function test_items_are_cast_to_array() {
        $this->assertIsArray($this->order->items);
        $this->assertCount(2, $this->order->items);
        $this->assertEquals(10.00, $this->order->items[0]['price']);
    }

    public function test_addresses_are_cast_to_array() {
        $this->assertIsArray($this->order->shipping_address);
        $this->assertIsArray($this->order->billing_address);
        $this->assertEquals('123 Test St', $this->order->shipping_address['street']);
        $this->assertEquals('Test City', $this->order->billing_address['city']);
    }

    public function test_total_is_cast_to_float() {
        $this->assertIsFloat($this->order->total);
        $this->assertEquals(35.00, $this->order->total);
    }

    public function test_order_can_be_created_with_minimum_required_fields() {
        $order = Order::factory()->create([
            'user_id' => $this->user->id,
            'items' => [['id' => 1, 'quantity' => 1, 'price' => 10.00]],
            'total' => 10.00,
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending'
        ]);

        $this->assertInstanceOf(Order::class, $order);
        $this->assertEquals('pending', $order->status);
        $this->assertEquals(10.00, $order->total);
    }

    public function test_order_attributes_can_be_updated() {
        $this->order->update([
            'status' => 'processing',
            'payment_status' => 'paid',
            'shipping_status' => 'shipped'
        ]);

        $this->assertEquals('processing', $this->order->status);
        $this->assertEquals('paid', $this->order->payment_status);
        $this->assertEquals('shipped', $this->order->shipping_status);
    }
}
