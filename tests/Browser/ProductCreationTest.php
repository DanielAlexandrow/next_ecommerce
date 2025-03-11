<?php

namespace Tests\Browser;

use App\Models\User;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class ProductCreationTest extends DuskTestCase
{
    use DatabaseMigrations;

    public function test_admin_can_visit_new_product_page_and_see_form()
    {
        $admin = User::factory()->create([
            'role' => 'admin'
        ]);

        $this->browse(function (Browser $browser) use ($admin) {
            $browser->loginAs($admin)
                   ->visit('/products/create')
                   ->assertInertia(fn ($page) => $page
                       ->component('admin/NewProduct')
                       ->has('errors', 0)
                   )
                   ->assertVisible('@product-form')
                   ->assertSee('Create New Product')
                   ->assertNoConsoleErrors();
        });
    }
}