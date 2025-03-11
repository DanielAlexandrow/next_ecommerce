<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Illuminate\Support\Str;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class ProductListingTest extends DuskTestCase
{
    use DatabaseMigrations;
    
    protected $user;
    protected $category;
    protected $products = [];
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create user
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password')
        ]);

        // Create category with slug
        $this->category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category' // Add the required slug
        ]);

        // Create brand
        $brand = Brand::create(['name' => 'Test Brand']);
        
        // Create products
        for ($i = 1; $i <= 10; $i++) {
            $price = $i * 100;
            $product = Product::factory()->create([
                'name' => "Product $i",
                'description' => "Description for product $i",
                'available' => true,
                'brand_id' => $brand->id
            ]);
            
            $product->categories()->attach($this->category->id);
            $this->products[] = $product;
        }
    }

    public function testItDisplaysProductsWithPagination()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/store/products')
                    ->waitFor('.product-list')
                    ->assertSee('Product 1')
                    ->assertSee('Product 5')
                    ->assertPresent('.pagination');
        });
    }

    public function testItFiltersByPriceRange()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/store/products')
                    ->waitFor('.price-filter')
                    ->value('@price-min', 300)
                    ->value('@price-max', 700)
                    ->press('Apply Filter')
                    ->waitForReload()
                    ->assertSee('Product 3')
                    ->assertSee('Product 7')
                    ->assertDontSee('Product 1')
                    ->assertDontSee('Product 9');
        });
    }

    public function testItFiltersByCategory()
    {
        // Create second category for testing
        $secondCategory = Category::create([
            'name' => 'Second Category',
            'slug' => 'second-category'
        ]);
        
        // Assign some products to the second category
        $this->products[2]->categories()->attach($secondCategory->id);
        $this->products[4]->categories()->attach($secondCategory->id);
        
        $this->browse(function (Browser $browser) use ($secondCategory) {
            $browser->visit('/store/products')
                    ->waitFor('.category-filter')
                    ->click('.category-' . $secondCategory->id)
                    ->waitForReload()
                    ->assertSee('Product 3')
                    ->assertSee('Product 5')
                    ->assertDontSee('Product 1')
                    ->assertDontSee('Product 7');
        });
    }
}