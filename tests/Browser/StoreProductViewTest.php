<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Subproduct;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class StoreProductViewTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected $product;
    protected $brand;
    protected $category;
    protected $subproducts;

    protected function setUp(): void
    {
        parent::setUp();

        $this->brand = Brand::create(['name' => 'Test Brand']);
        $this->category = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category'
        ]);

        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'description' => 'Test Description',
            'brand_id' => $this->brand->id,
            'available' => true
        ]);

        $this->product->categories()->attach($this->category->id);

        // Create subproducts
        $this->subproducts = [
            Subproduct::create([
                'product_id' => $this->product->id,
                'name' => 'Small Size',
                'price' => 19.99,
                'available' => true,
                'stock' => 10
            ]),
            Subproduct::create([
                'product_id' => $this->product->id,
                'name' => 'Medium Size',
                'price' => 29.99,
                'available' => true,
                'stock' => 5
            ])
        ];
    }

    public function testUserCanViewProductDetails()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/store/products/' . $this->product->id)
                   ->waitFor('.product-details')
                   ->assertSee($this->product->name)
                   ->assertSee($this->product->description)
                   ->assertSee($this->brand->name)
                   ->assertSee('Small Size')
                   ->assertSee('Medium Size')
                   ->assertNoConsoleErrors();
        });
    }

    public function testProductSearch()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/store/products')
                   ->waitFor('.search-form')
                   ->type('@search-input', 'Test Product')
                   ->press('@search-button')
                   ->waitFor('.search-results')
                   ->assertSee($this->product->name)
                   ->assertSee($this->brand->name)
                   ->assertNoConsoleErrors();
        });
    }

    public function testProductPriceFilter()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/store/products')
                   ->waitFor('.filter-form')
                   ->type('@price-min', '15')
                   ->type('@price-max', '25')
                   ->press('@apply-filters')
                   ->waitFor('.product-list')
                   ->assertSee('Small Size')
                   ->assertDontSee('Medium Size')
                   ->assertNoConsoleErrors();
        });
    }

    public function testOutOfStockProductDisplay()
    {
        // Set stock to 0
        $this->subproducts[0]->update(['stock' => 0]);

        $this->browse(function (Browser $browser) {
            $browser->visit('/store/products/' . $this->product->id)
                   ->waitFor('.product-details')
                   ->assertSee('Out of Stock')
                   ->assertSee('Small Size')
                   ->assertSee('Medium Size')
                   ->assertAttribute('@add-to-cart-button', 'disabled', 'true')
                   ->assertNoConsoleErrors();
        });
    }

    public function testProductVariantSelection()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/store/products/' . $this->product->id)
                   ->waitFor('.product-details')
                   ->select('@variant-selector', $this->subproducts[0]->id)
                   ->assertSee('$19.99')
                   ->select('@variant-selector', $this->subproducts[1]->id)
                   ->assertSee('$29.99')
                   ->assertNoConsoleErrors();
        });
    }

    public function testUnavailableProductRedirect()
    {
        // Make product unavailable
        $this->product->update(['available' => false]);

        $this->browse(function (Browser $browser) {
            $browser->visit('/store/products/' . $this->product->id)
                   ->assertPathIs('/store/products')
                   ->assertSee('Product is not available')
                   ->assertNoConsoleErrors();
        });
    }
}