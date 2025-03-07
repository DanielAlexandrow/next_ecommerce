<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Models\OrderItem;
use App\Models\Subproduct;
use App\Models\Product;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderPdfGenerationTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_generates_pdf_for_authorized_user_order()
    {
        // Create a user
        $user = User::factory()->create();
        
        // Create an order for the user
        $order = Order::factory()->create([
            'user_id' => $user->id,
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'total' => 119.96
        ]);
        
        // Create a product
        $product = Product::factory()->create();
        
        // Create a subproduct
        $subproduct = Subproduct::factory()->create([
            'name' => 'Standard',
            'price' => 29.99,
            'product_id' => $product->id,
        ]);
        
        // Create order items
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct->id,
            'quantity' => 4,
            'price' => 29.99
        ]);

        // Act as the user
        $response = $this->actingAs($user)
            ->get("/orders/generatepdf/{$order->id}");

        // Assert response
        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
    }

    /** @test */
    public function it_denies_access_to_another_users_order_pdf()
    {
        // Create two users
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        // Create an order for the first user
        $order = Order::factory()->create([
            'user_id' => $user1->id
        ]);

        // Act as the second user
        $response = $this->actingAs($user2)
            ->get("/orders/generatepdf/{$order->id}");

        // Assert response
        $response->assertStatus(403);
    }
    
    /** @test */
    public function it_returns_404_for_nonexistent_order()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)
            ->get("/orders/generatepdf/999999");
            
        $response->assertStatus(404);
    }
}
