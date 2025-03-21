<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Review;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Subproduct;
use Illuminate\Support\Facades\Schema;

class ReviewTest extends TestCase
{
    private User $user;
    private Product $product;
    private Review $review;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure tables are dropped
        Schema::dropIfExists('reviews');
        
        $this->artisan('migrate:fresh');
        
        $this->user = User::factory()->create();
        $this->product = Product::factory()->create();
        $this->review = Review::factory()->make([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id
        ]);
    }

    public function test_review_belongs_to_user()
    {
        $review = Review::factory()->create();
        $this->assertInstanceOf(User::class, $review->user);
    }

    public function test_review_belongs_to_product()
    {
        $review = Review::factory()->create();
        $this->assertInstanceOf(Product::class, $review->product);
    }

    public function test_review_requires_valid_rating()
    {
        // Test invalid ratings
        $this->review->rating = 6;
        $this->assertFalse($this->review->save());

        $this->review->rating = 0;
        $this->assertFalse($this->review->save());

        // Test valid ratings
        $this->review->rating = 5;
        $this->assertTrue($this->review->save());

        $this->review->rating = 1;
        $this->assertTrue($this->review->save());
    }

    public function test_user_can_only_review_once_per_product()
    {
        // Create first review
        $this->review->save();

        // Try to create second review
        $secondReview = Review::factory()->make([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);
        $secondReview->save();
    }
}
