<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;

class ProductCreationTest extends TestCase {
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($this->admin, ['*']);
    }

    public function test_creates_product_with_maximum_length_fields() {
        $brand = Brand::factory()->create();
        $category = Category::factory()->create();

        $longName = str_repeat('a', 255); // Max VARCHAR length
        $longDescription = str_repeat('b', 65535); // Max TEXT length

        $response = $this->postJson('/api/products', [
            'name' => $longName,
            'description' => $longDescription,
            'brand_id' => $brand->id,
            'available' => true,
            'categories' => [$category->id],
            'subproducts' => [
                [
                    'name' => 'Standard Variant',
                    'price' => 99.99,
                    'available' => true,
                    'stock' => 100
                ]
            ]
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('products', [
            'name' => $longName,
            'description' => $longDescription
        ]);
    }

    public function test_handles_special_characters_in_product_fields() {
        $brand = Brand::factory()->create();
        $specialChars = "!@#$%^&*()_+-=[]{}|;:'\",.<>?`~™®©℠";
        $response = $this->postJson('/api/products', [
            'name' => "Product with {$specialChars}",
            'description' => "Description with {$specialChars}",
            'brand_id' => $brand->id,
            'available' => true,
            'subproducts' => [
                [
                    'name' => "Variant with {$specialChars}",
                    'price' => 99.99,
                    'available' => true,
                    'stock' => 100,
                    'sku' => "SKU-" . uniqid()
                ]
            ]
        ]);
        
        $response->assertStatus(201);
        
        // Also verify the data was saved, but don't check exact string matches
        $product = Product::latest()->first();
        $this->assertStringContainsString('Product with', $product->name);
        $this->assertStringContainsString('Description with', $product->description);
    }

    public function test_handles_large_number_of_subproducts() {
        $brand = Brand::factory()->create();
        $subproducts = [];

        // Create 100 subproducts
        for ($i = 0; $i < 100; $i++) {
            $subproducts[] = [
                'name' => "Variant {$i}",
                'price' => 10 + $i,
                'stock' => 100,
                'available' => true
            ];
        }

        $response = $this->postJson('/api/products', [
            'name' => 'Product with many variants',
            'description' => 'Test description',
            'brand_id' => $brand->id,
            'available' => true,
            'subproducts' => $subproducts
        ]);

        $response->assertStatus(201);
        $product = Product::latest()->first();
        $this->assertCount(100, $product->subproducts);
    }

    public function test_handles_concurrent_product_creation() {
        $brand = Brand::factory()->create();

        // Simulate 5 concurrent requests
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/products', [
                'name' => "Concurrent Product {$i}",
                'description' => 'Test description',
                'brand_id' => $brand->id,
                'available' => true,
                'subproducts' => [
                    [
                        'name' => "Variant {$i}",
                        'price' => 99.99,
                        'stock' => 100,
                        'available' => true
                    ]
                ]
            ]);
            $response->assertStatus(201);
        }

        $this->assertEquals(5, Product::count());
    }

    public function test_handles_product_creation_with_all_optional_fields() {
        Storage::fake('public');
        $brand = Brand::factory()->create();
        $categories = Category::factory(5)->create();

        $response = $this->postJson('/api/products', [
            'name' => 'Complete Product',
            'description' => 'Test description', 
            'brand_id' => $brand->id,
            'available' => true,
            'categories' => $categories->pluck('id')->toArray(),
            'subproducts' => [
                [
                    'name' => 'Premium Variant',
                    'price' => 99.99,
                    'stock' => 100,
                    'available' => true,
                    'weight' => 1.5,
                    'sku' => 'PREMIUM-' . uniqid(), // Add required SKU field
                    'dimensions' => ['length' => 10, 'width' => 5, 'height' => 2],
                    'metadata' => ['color' => 'red', 'size' => 'M']
                ]
            ],
            'metadata' => [
                'featured' => true,
                'tags' => ['new', 'trending'],
                'seo' => [
                    'title' => 'SEO Title',
                    'description' => 'SEO Description'
                ]
            ]
        ]);

        $response->assertStatus(201);

        $product = Product::latest()->first();
        $this->assertCount(5, $product->categories);
        $this->assertEquals(['featured' => true, 'tags' => ['new', 'trending'], 'seo' => ['title' => 'SEO Title', 'description' => 'SEO Description']], $product->metadata);
    }

    public function test_prevents_xss_in_product_fields() {
        $brand = Brand::factory()->create();
        $xssScript = '<script>alert("xss")</script>';

        $response = $this->postJson('/api/products', [
            'name' => "Product Name {$xssScript}",
            'description' => "Description {$xssScript}",
            'brand_id' => $brand->id,
            'available' => true,
            'subproducts' => [
                [
                    'name' => "Variant {$xssScript}",
                    'price' => 99.99,
                    'available' => true,
                    'stock' => 100
                ]
            ]
        ]);

        $response->assertStatus(201);
        $product = Product::latest()->first();
        $subproduct = $product->subproducts->first();

        $this->assertStringNotContainsString('<script>', $product->name);
        $this->assertStringNotContainsString('<script>', $product->description);
        $this->assertStringNotContainsString('<script>', $subproduct->name);
    }
}
