<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    private $user;
    private $product;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user
        $this->user = User::factory()->create();
        
        // Create a product
        $this->product = Product::factory()->create();
    }
    
    public function test_user_can_create_review()
    {
        $reviewData = [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'title' => 'Great product',
            'content' => 'This product exceeded my expectations.',
            'rating' => 5
        ];
        
        $review = Review::create($reviewData);
        
        $this->assertDatabaseHas('reviews', [
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'rating' => 5
        ]);
    }
    
    public function test_user_can_update_review()
    {
        // Create initial review
        $review = Review::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'title' => 'Initial title',
            'content' => 'Initial content',
            'rating' => 3
        ]);
        
        // Update the review
        $review->update([
            'title' => 'Updated title',
            'content' => 'Updated content',
            'rating' => 4
        ]);
        
        $this->assertDatabaseHas('reviews', [
            'id' => $review->id,
            'title' => 'Updated title',
            'rating' => 4
        ]);
    }
    
    public function test_user_can_delete_review()
    {
        // Create initial review
        $review = Review::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'title' => 'Test title',
            'content' => 'Test content',
            'rating' => 5
        ]);
        
        $reviewId = $review->id;
        $review->delete();
        
        $this->assertDatabaseMissing('reviews', ['id' => $reviewId]);
    }
    
    public function test_user_can_only_review_once_per_product()
    {
        // Create initial review
        Review::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'title' => 'My review',
            'content' => 'Content',
            'rating' => 4
        ]);
        
        // Add a unique constraint expectation at the database level
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        // Attempt to create a duplicate review (should fail)
        Review::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'title' => 'Another review',
            'content' => 'Another content',
            'rating' => 5
        ]);
    }
    
    public function test_review_belongs_to_user()
    {
        $review = Review::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'title' => 'Test title',
            'content' => 'Test content',
            'rating' => 5
        ]);
        
        $this->assertInstanceOf(User::class, $review->user);
        $this->assertEquals($this->user->id, $review->user->id);
    }
    
    public function test_review_belongs_to_product()
    {
        $review = Review::create([
            'user_id' => $this->user->id,
            'product_id' => $this->product->id,
            'title' => 'Test title',
            'content' => 'Test content',
            'rating' => 5
        ]);
        
        $this->assertInstanceOf(Product::class, $review->product);
        $this->assertEquals($this->product->id, $review->product->id);
    }
}
