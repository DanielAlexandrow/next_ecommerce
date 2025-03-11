<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\Order;
use App\Models\AddressInfo;
use App\Models\Product;
use App\Models\Subproduct;
use App\Models\OrderItem;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class UserProfileTest extends DuskTestCase
{
    use DatabaseMigrations;

    protected $user;
    protected $addressInfo;
    protected $order;

    protected function setUp(): void
    {
        parent::setUp();

        // Create address info
        $this->addressInfo = AddressInfo::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'postcode' => '12345',
            'city' => 'Test City',
            'country' => 'Test Country',
            'street' => '123 Test Street'
        ]);

        // Create user with address info
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'id_address_info' => $this->addressInfo->id
        ]);

        // Create product and subproduct
        $product = Product::factory()->create([
            'name' => 'Test Product',
            'available' => true
        ]);

        $subproduct = Subproduct::factory()->create([
            'product_id' => $product->id,
            'name' => 'Test Variant',
            'price' => 99.99,
            'available' => true
        ]);

        // Create order
        $this->order = Order::create([
            'user_id' => $this->user->id
        ]);

        // Create order item
        OrderItem::create([
            'order_id' => $this->order->id,
            'subproduct_id' => $subproduct->id,
            'quantity' => 2
        ]);
    }

    public function testUserCanViewProfileInformation()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                    ->type('email', $this->user->email)
                    ->type('password', 'password')
                    ->press('Log in')
                    ->visit('/profile')
                    ->waitFor('.profile-container')
                    ->assertSee($this->user->name)
                    ->assertSee($this->user->email);
        });
    }

    public function testUserCanUpdateAddressInformation()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                    ->type('email', $this->user->email)
                    ->type('password', 'password')
                    ->press('Log in')
                    ->visit('/profile/adressinfo')
                    ->waitFor('.address-form')
                    ->assertInputValue('name', $this->addressInfo->name)
                    ->type('city', 'New Test City')
                    ->press('Update Address')
                    ->waitFor('.success-message')
                    ->assertSee('Address updated successfully');
        });
    }

    public function testUserCanViewOrderHistory()
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                    ->type('email', $this->user->email)
                    ->type('password', 'password')
                    ->press('Log in')
                    ->visit('/profile/orders')
                    ->waitFor('.orders-list')
                    ->assertSee('Order #' . $this->order->id)
                    ->click('.order-' . $this->order->id)
                    ->waitFor('.order-details')
                    ->assertSee('Test Product')
                    ->assertSee('Test Variant');
        });
    }
}