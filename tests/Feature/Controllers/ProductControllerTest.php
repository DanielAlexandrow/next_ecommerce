<?php

namespace Tests\Feature\Controllers;

use Tests\TestCase;
use App\Models\User;
use App\Models\Brand;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProductControllerTest extends TestCase
{
    use RefreshDatabase;
    private $brand;
    private $product;
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a brand for product creation
        $this->brand = Brand::factory()->create(['name' => 'Test Brand']);
    }

    public function test_admin_can_create_product()
    {
        // Login as admin
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $productData = [
            'name' => 'Test Product',
            'description' => 'Test product description',
            'brand_id' => $this->brand->id,
            'available' => true,
            'subproducts' => [
                [
                    'name' => 'Test Variant',
                    'price' => 99.99,
                    'stock' => 10,
                    'available' => true,
                    'sku' => 'TEST-SKU-001'
                ]
            ]
        ];

        $response = $this->postJson('/api/products', $productData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'product' => [
                    'id',
                    'name',
                    'description',
                    'brand_id',
                    'available'
                ]
            ])
            ->assertJson([
                'success' => true,
                'product' => [
                    'name' => 'Test Product',
                    'description' => 'Test product description',
                    'brand_id' => $this->brand->id,
                    'available' => true
                ]
            ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'description' => 'Test product description',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);

        // Verify subproduct was created
        $this->assertDatabaseHas('subproducts', [
            'name' => 'Test Variant',
            'price' => 99.99,
            'stock' => 10,
            'available' => true,
            'sku' => 'TEST-SKU-001'
        ]);
    }

    public function test_non_admin_cannot_create_product()
    {
        // Login as regular user
        $user = User::factory()->create(['role' => 'customer']);
        $this->actingAs($user);

        $productData = [
            'name' => 'Test Product',
            'description' => 'Test product description',
            'brand_id' => $this->brand->id
        ];

        $response = $this->postJson('/api/products', $productData);
        
        $response->assertStatus(403);
    }

    public function test_product_creation_validates_required_fields()
    {
        // Login as admin
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $invalidData = [
            'description' => 'Test product description',
            'available' => true
        ];

        $response = $this->postJson('/api/products', $invalidData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'subproducts']);
    }

    public function test_product_creation_validates_subproduct_fields()
    {
        // Login as admin
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        $invalidData = [
            'name' => 'Test Product',
            'description' => 'Test product description',
            'subproducts' => [
                [
                    // Missing required fields
                    'available' => true
                ]
            ]
        ];

        $response = $this->postJson('/api/products', $invalidData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'subproducts.0.name',
                'subproducts.0.price',
                'subproducts.0.sku'
            ]);
    }
}
