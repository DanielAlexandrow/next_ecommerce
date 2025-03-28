<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        fwrite(STDERR, "\n🚀 Starting Product Feature Test\n");
    }

    protected function tearDown(): void
    {
        fwrite(STDERR, "✅ Completed Product Feature Test\n");
        parent::tearDown();
    }

    /** @test */
    public function it_can_list_products()
    {
        fwrite(STDERR, "\n📝 Testing product listing...\n");
        
        // Create test products
        $products = Product::factory()->count(3)->create();
        fwrite(STDERR, sprintf("🏭 Created %d test products\n", $products->count()));

        $response = $this->getJson('/api/products');
        fwrite(STDERR, sprintf("📊 Response status: %d\n", $response->status()));
        
        $responseData = $response->json();
        fwrite(STDERR, sprintf("📦 Retrieved %d products\n", count($responseData['data'])));

        $response->assertStatus(200)
                ->assertJsonStructure(['data']);

        fwrite(STDERR, "✨ Product listing test completed successfully\n");
    }

    /** @test */
    public function it_can_create_a_product()
    {
        fwrite(STDERR, "\n📝 Testing product creation...\n");
        
        $productData = [
            'name' => 'Test Product',
            'description' => 'Test Description',
            'price' => 99.99,
            'available' => true
        ];
        fwrite(STDERR, "📤 Product data prepared: " . json_encode($productData) . "\n");

        $response = $this->postJson('/api/products', $productData);
        fwrite(STDERR, sprintf("📊 Response status: %d\n", $response->status()));
        
        $responseData = $response->json();
        fwrite(STDERR, "📥 Created product ID: " . ($responseData['id'] ?? 'none') . "\n");

        $response->assertStatus(201)
                ->assertJsonFragment(['name' => 'Test Product']);

        fwrite(STDERR, "✨ Product creation test completed successfully\n");
    }

    /** @test */
    public function it_validates_product_data()
    {
        fwrite(STDERR, "\n📝 Testing product validation...\n");
        
        $invalidData = [
            'name' => '',
            'price' => 'not-a-number'
        ];
        fwrite(STDERR, "⚠️ Testing with invalid data: " . json_encode($invalidData) . "\n");

        $response = $this->postJson('/api/products', $invalidData);
        fwrite(STDERR, sprintf("📊 Response status: %d\n", $response->status()));
        
        $errors = $response->json('errors');
        fwrite(STDERR, "❌ Validation errors: " . json_encode($errors) . "\n");

        $response->assertStatus(422)
                ->assertJsonValidationErrors(['name', 'price']);

        fwrite(STDERR, "✨ Validation test completed successfully\n");
    }

    // ...existing code...
}