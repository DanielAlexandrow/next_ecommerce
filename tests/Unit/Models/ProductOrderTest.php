<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Subproduct;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductOrderTest extends TestCase {
    use RefreshDatabase;

    public function test_product_can_be_ordered_through_subproduct() {
        // Arrange
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $subproduct = $product->subproducts()->save(
            Subproduct::factory()->make([
                'name' => 'Standard',
                'price' => 99.99,
                'available' => true,
                'stock' => 10
            ])
        );

        $order = Order::create([
            'user_id' => $user->id,
            'total' => 99.99,
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending'
        ]);

        // Act
        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct->id,
            'quantity' => 1,
            'price' => 99.99
        ]);

        // Assert
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'subproduct_id' => $subproduct->id,
            'quantity' => 1,
            'price' => 99.99
        ]);

        $this->assertTrue($order->orderItems->contains($orderItem));
        $this->assertEquals($product->id, $orderItem->subproduct->product_id);
        $this->assertEquals(99.99, $orderItem->price);
    }

    public function test_product_can_be_ordered_through_subproduct_variant() {
        // Arrange
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $subproduct = $product->subproducts()->save(
            Subproduct::factory()->make([
                'name' => 'Premium',
                'price' => 149.99,
                'available' => true,
                'stock' => 5
            ])
        );

        $order = Order::create([
            'user_id' => $user->id,
            'total' => 299.98,
            'status' => 'processing',
            'payment_status' => 'paid',
            'shipping_status' => 'pending'
        ]);

        // Act
        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct->id,
            'quantity' => 2,
            'price' => 149.99
        ]);

        // Assert
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'subproduct_id' => $subproduct->id,
            'quantity' => 2,
            'price' => 149.99
        ]);

        $this->assertTrue($order->orderItems->contains($orderItem));
        $this->assertEquals($product->id, $orderItem->subproduct->product_id);
        $this->assertEquals(149.99, $orderItem->price);
    }

    public function test_order_total_matches_order_items_sum() {
        // Arrange
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $subproduct1 = $product->subproducts()->save(
            Subproduct::factory()->make([
                'name' => 'Standard',
                'price' => 99.99,
                'available' => true,
                'stock' => 10
            ])
        );

        $subproduct2 = $product->subproducts()->save(
            Subproduct::factory()->make([
                'name' => 'Premium',
                'price' => 149.99,
                'available' => true,
                'stock' => 5
            ])
        );

        $order = Order::create([
            'user_id' => $user->id,
            'total' => 0, // Initial total
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending'
        ]);

        // Act
        $orderItem1 = OrderItem::create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct1->id,
            'quantity' => 2,
            'price' => $subproduct1->price
        ]);

        $orderItem2 = OrderItem::create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct2->id,
            'quantity' => 1,
            'price' => $subproduct2->price
        ]);

        $expectedTotal = ($subproduct1->price * 2) + ($subproduct2->price * 1);
        $order->update(['total' => $expectedTotal]);

        // Assert
        $this->assertEquals($expectedTotal, $order->total);
        $this->assertEquals(349.97, $order->total); // 99.99 * 2 + 149.99
        $this->assertEquals(2, $order->orderItems()->count());
        $this->assertEquals(3, $order->orderItems()->sum('quantity'));
    }

    public function test_order_total_matches_order_items_sum_variant() {
        // Arrange
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $subproduct1 = $product->subproducts()->save(
            Subproduct::factory()->make([
                'name' => 'Basic',
                'price' => 49.99,
                'available' => true,
                'stock' => 20
            ])
        );

        $subproduct2 = $product->subproducts()->save(
            Subproduct::factory()->make([
                'name' => 'Deluxe',
                'price' => 199.99,
                'available' => true,
                'stock' => 3
            ])
        );

        $order = Order::create([
            'user_id' => $user->id,
            'total' => 0, // Initial total
            'status' => 'processing',
            'payment_status' => 'paid',
            'shipping_status' => 'shipped'
        ]);

        // Act
        $orderItem1 = OrderItem::create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct1->id,
            'quantity' => 3,
            'price' => $subproduct1->price
        ]);

        $orderItem2 = OrderItem::create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct2->id,
            'quantity' => 2,
            'price' => $subproduct2->price
        ]);

        $expectedTotal = ($subproduct1->price * 3) + ($subproduct2->price * 2);
        $order->update(['total' => $expectedTotal]);

        // Assert
        $this->assertEquals($expectedTotal, $order->total);
        $this->assertEquals(549.95, $order->total); // 49.99 * 3 + 199.99 * 2
        $this->assertEquals(2, $order->orderItems()->count());
        $this->assertEquals(5, $order->orderItems()->sum('quantity'));
    }
}
