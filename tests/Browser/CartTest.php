<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\Product;
use App\Models\Subproduct;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class CartTest extends DuskTestCase
{
    use DatabaseMigrations;
    
    protected $user;
    protected $product;
    protected $subproduct;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password')
        ]);

        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'available' => true
        ]);

        $this->subproduct = Subproduct::factory()->create([
            'product_id' => $this->product->id,
            'name' => 'Test Variant',
            'price' => 99.99,
            'available' => true
        ]);
    }

    public function testGuestCanAddItemToCart()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/store/products/' . $this->product->id)
                    ->waitFor('.product-details')
                    ->select('subproduct', $this->subproduct->id)
                    ->type('quantity', 1)
                    ->press('Add to Cart')
                    ->waitFor('.cart-notification')
                    ->assertSee('Item added to cart')
                    ->click('.cart-icon')
                    ->waitFor('.cart-items')
                    ->assertSee($this->product->name)
                    ->assertSee($this->subproduct->name);
        });
    }

    public function testLoggedInUserCanCheckout()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                    ->type('email', $this->user->email)
                    ->type('password', 'password')
                    ->press('Log in')
                    ->visit('/store/products/' . $this->product->id)
                    ->waitFor('.product-details')
                    ->select('subproduct', $this->subproduct->id)
                    ->type('quantity', 1)
                    ->press('Add to Cart')
                    ->click('.cart-icon')
                    ->waitFor('.cart-items')
                    ->press('Proceed to Checkout')
                    ->waitFor('.checkout-form')
                    ->assertPathIs('/checkout');
        });
    }

    public function testCartUpdatesQuantityCorrectly()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/store/products/' . $this->product->id)
                    ->waitFor('.product-details')
                    ->select('subproduct', $this->subproduct->id)
                    ->type('quantity', 1)
                    ->press('Add to Cart')
                    ->click('.cart-icon')
                    ->waitFor('.cart-items')
                    ->type('.quantity-input', 2)
                    ->waitFor('.cart-total')
                    ->assertSee(number_format($this->subproduct->price * 2, 2));
        });
    }
}