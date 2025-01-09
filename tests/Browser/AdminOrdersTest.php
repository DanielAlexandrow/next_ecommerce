<?php

namespace Tests\Browser;

use App\Models\User;
use App\Models\Order;
use App\Models\Guest;
use App\Models\AddressInfo;
use Tests\DuskTestCase;
use Laravel\Dusk\Browser;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class AdminOrdersTest extends DuskTestCase {
    use DatabaseMigrations;

    private User $admin;
    private Order $order;

    protected function setUp(): void {
        parent::setUp();

        // Create admin user
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password')
        ]);

        // Create address info
        $addressInfo = AddressInfo::create([
            'name' => 'John Doe',
            'address' => '123 Test St',
            'city' => 'Test City',
            'postal_code' => '12345',
            'country' => 'Test Country',
            'phone' => '123-456-7890'
        ]);

        // Create guest
        $guest = Guest::create([
            'id_address_info' => $addressInfo->id,
            'email' => 'guest@example.com',
            'phone' => '123-456-7890'
        ]);

        // Create test order
        $this->order = Order::create([
            'guest_id' => $guest->id,
            'total' => 99.99,
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending'
        ]);
    }

    /** @test */
    public function it_has_no_console_errors_on_orders_list_page() {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit('/orders')
                ->assertTitle('Orders - Admin')
                ->assertSee('Orders')
                ->waitFor('.orders-table')
                ->assertNoConsoleErrors();

            // Test search functionality
            $browser->type('@search-input', $this->order->id)
                ->waitFor('.orders-table')
                ->assertSee($this->order->id)
                ->assertNoConsoleErrors();

            // Test sorting
            $browser->click('@sort-created_at')
                ->waitFor('.orders-table')
                ->assertNoConsoleErrors()
                ->click('@sort-total')
                ->waitFor('.orders-table')
                ->assertNoConsoleErrors();
        });
    }

    /** @test */
    public function it_has_no_console_errors_on_order_details_page() {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit("/orders/{$this->order->id}")
                ->assertTitle("Order #{$this->order->id} - Admin")
                ->waitFor('.order-details')
                ->assertSee($this->order->id)
                ->assertNoConsoleErrors();

            // Test status updates
            $browser->select('@order-status', 'processing')
                ->waitForText('Status updated successfully')
                ->assertNoConsoleErrors();
        });
    }

    /** @test */
    public function it_has_no_console_errors_when_generating_pdf() {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit("/orders/{$this->order->id}")
                ->waitFor('@generate-pdf')
                ->click('@generate-pdf')
                ->waitForText('PDF generated successfully')
                ->assertNoConsoleErrors();
        });
    }

    /** @test */
    public function it_has_no_console_errors_with_pagination() {
        // Create 25 more orders for pagination
        Order::factory()->count(25)->create();

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit('/orders')
                ->waitFor('.orders-table')
                ->assertSee('Next')
                ->click('@next-page')
                ->waitFor('.orders-table')
                ->assertNoConsoleErrors()
                ->click('@prev-page')
                ->waitFor('.orders-table')
                ->assertNoConsoleErrors();
        });
    }

    /** @test */
    public function it_has_no_console_errors_with_filters() {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit('/orders')
                ->waitFor('.orders-table')
                ->click('@filter-button')
                ->waitFor('.filter-panel')
                ->select('@status-filter', 'pending')
                ->waitFor('.orders-table')
                ->assertNoConsoleErrors()
                ->select('@payment-status-filter', 'paid')
                ->waitFor('.orders-table')
                ->assertNoConsoleErrors();
        });
    }

    /** @test */
    public function it_has_no_console_errors_with_rapid_interactions() {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit('/orders')
                ->waitFor('.orders-table')
                // Rapid sorting changes
                ->click('@sort-created_at')
                ->click('@sort-total')
                ->click('@sort-status')
                ->pause(500)
                ->assertNoConsoleErrors()
                // Rapid filter changes
                ->select('@status-filter', 'pending')
                ->select('@status-filter', 'completed')
                ->select('@status-filter', 'processing')
                ->pause(500)
                ->assertNoConsoleErrors();
        });
    }
}
