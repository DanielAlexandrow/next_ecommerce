<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Review;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Subproduct;
use Illuminate\Support\Facades\Schema;

class ReviewControllerTest extends TestCase
{
    private User $user;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->product = Product::factory()->create();
    }

    public function test_user_can_view_product_reviews()
    {
        // No authentication needed for viewing reviews
        Review::factory(3)->create(['product_id' => $this->product->id]);
        $response = $this->getJson("/products/{$this->product->id}/reviews");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'reviews' => [
                    '*' => ['id', 'title', 'content', 'rating', 'user']
                ],
                'average_rating',
                'total_reviews'
            ]);
    }

    public function test_user_cannot_review_without_purchase()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/products/{$this->product->id}/reviews", [
                'title' => 'Test Review',
                'content' => 'Test Content',
                'rating' => 5
            ]);

        $response->assertStatus(403);
    }

    public function test_user_can_review_after_purchase()
    {
        // Create order with product
        $subproduct = Subproduct::factory()->create(['product_id' => $this->product->id]);
        $order = Order::factory()->create(['user_id' => $this->user->id]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct->id
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/products/{$this->product->id}/reviews", [
                'title' => 'Test Review',
                'content' => 'Test Content',
                'rating' => 5
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['id', 'title', 'content', 'rating', 'user']);
    }

    public function test_user_can_update_own_review()
    {
        $review = Review::factory()->create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/reviews/{$review->id}", [
                'title' => 'Updated Title',
                'content' => 'Updated Content',
                'rating' => 4
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'title' => 'Updated Title',
                'content' => 'Updated Content',
                'rating' => 4
            ]);
    }

    public function test_user_cannot_update_others_review()
    {
        $otherUser = User::factory()->create();
        $review = Review::factory()->create([
            'user_id' => $otherUser->id,
            'product_id' => $this->product->id
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/reviews/{$review->id}", [
                'title' => 'Updated Title',
                'content' => 'Updated Content',
                'rating' => 4
            ]);

        $response->assertStatus(403);
    }

    public function test_validation_rules()
    {
        // Create a purchase first so we test validation before purchase verification
        $subproduct = Subproduct::factory()->create(['product_id' => $this->product->id]);
        $order = Order::factory()->create(['user_id' => $this->user->id]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct->id
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/products/{$this->product->id}/reviews", [
                'title' => '',
                'content' => '',
                'rating' => 10
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'rating']);
    }
}
