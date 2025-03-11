<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class AdminProductTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected $admin;
    protected $brand;
    protected $category;
    protected $product;

    protected function setUp(): void
    {
        parent::setUp();

        // Create admin user
        $this->admin = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);

        // Create brand and category
        $this->brand = Brand::create(['name' => 'Test Brand']);
        $this->category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category'
        ]);

        // Create a test product
        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'description' => 'Test Description',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);
        
        $this->product->categories()->attach($this->category->id);
    }

    public function testAdminCanViewProductList()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                   ->visit('/admin/products')
                   ->waitFor('.product-list')
                   ->assertSee('Test Product')
                   ->assertSee($this->brand->name)
                   ->assertNoConsoleErrors();
        });
    }

    public function testAdminCanCreateNewProduct()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                   ->visit('/admin/products/create')
                   ->waitFor('.product-form')
                   ->type('@product-name', 'New Test Product')
                   ->type('@product-description', 'New Test Description')
                   ->select('@product-brand', $this->brand->id)
                   ->check('@product-available')
                   ->select('@product-category', $this->category->id)
                   ->press('Create Product')
                   ->waitFor('.success-message')
                   ->assertSee('Product created successfully')
                   ->assertPathIs('/admin/products')
                   ->assertSee('New Test Product')
                   ->assertNoConsoleErrors();
        });
    }

    public function testAdminCanUpdateProduct()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                   ->visit('/admin/products')
                   ->waitFor('.product-list')
                   ->click('.edit-product-' . $this->product->id)
                   ->waitFor('.product-form')
                   ->type('@product-name', 'Updated Product Name')
                   ->type('@product-description', 'Updated Description')
                   ->press('Update Product')
                   ->waitFor('.success-message')
                   ->assertSee('Product updated successfully')
                   ->assertSee('Updated Product Name')
                   ->assertNoConsoleErrors();
        });
    }

    public function testAdminCanDeleteProduct()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                   ->visit('/admin/products')
                   ->waitFor('.product-list')
                   ->click('.delete-product-' . $this->product->id)
                   ->waitFor('.confirmation-modal')
                   ->press('Confirm Delete')
                   ->waitFor('.success-message')
                   ->assertSee('Product deleted successfully')
                   ->assertDontSee('Test Product')
                   ->assertNoConsoleErrors();
        });
    }

    public function testNonAdminCannotAccessProductManagement()
    {
        $regularUser = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('password'),
            'role' => 'customer'
        ]);

        $this->browse(function (Browser $browser) use ($regularUser) {
            $browser->loginAs($regularUser)
                   ->visit('/admin/products')
                   ->assertPathIsNot('/admin/products')
                   ->assertSee('Unauthorized')
                   ->assertNoConsoleErrors();
        });
    }

    public function testProductValidation()
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                   ->visit('/admin/products/create')
                   ->waitFor('.product-form')
                   ->press('Create Product')
                   ->waitFor('.validation-errors')
                   ->assertSee('The name field is required')
                   ->assertSee('The brand id field is required')
                   ->assertNoConsoleErrors();
        });
    }

    public function testProductSortingAndFiltering()
    {
        // Create additional products for testing
        Product::factory()->create([
            'name' => 'A Test Product',
            'brand_id' => $this->brand->id
        ]);

        Product::factory()->create([
            'name' => 'Z Test Product',
            'brand_id' => $this->brand->id
        ]);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                   ->visit('/admin/products')
                   ->waitFor('.product-list')
                   // Test sorting
                   ->click('@sort-by-name')
                   ->waitFor('.product-list')
                   ->assertSeeIn('.product-item:first-child', 'A Test Product')
                   // Test filtering
                   ->type('@filter-search', 'Z Test')
                   ->waitFor('.product-list')
                   ->assertSee('Z Test Product')
                   ->assertDontSee('A Test Product')
                   ->assertNoConsoleErrors();
        });
    }
}