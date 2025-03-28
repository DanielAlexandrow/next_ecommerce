<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Subproduct;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $adminUser;
    protected $product;
    protected $subproduct;
    protected $cart;
    protected $order;

    public function setUp(): void
    {
        parent::setUp();

        // Create users with different roles
        $this->user = User::factory()->create([
            'role' => 'customer'
        ]);

        $this->adminUser = User::factory()->create([
            'role' => 'admin'
        ]);

        // Create a test product with a subproduct
        $this->product = Product::factory()->create([
            'name' => 'Test Product',
            'description' => 'Test product description',
            'available' => true,
        ]);

        $this->subproduct = Subproduct::factory()->create([
            'product_id' => $this->product->id,
            'name' => 'Test Size',
            'price' => 19.99,
            'available' => true,
        ]);

        // Create a cart for the user
        $this->cart = Cart::factory()->create([
            'user_id' => $this->user->id,
        ]);

        // Create an order for the user
        $this->order = Order::factory()->create([
            'user_id' => $this->user->id,
            'total' => 19.99,
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'subproduct_id' => $this->subproduct->id,
                    'quantity' => 1,
                    'price' => 19.99,
                    'name' => 'Test Product',
                    'variant' => 'Test Size',
                ],
            ],
        ]);
    }

    /**
     * Test product listing API used by ProductList component
     */
    public function test_admin_can_fetch_products()
    {
        $response = $this->actingAs($this->adminUser)
            ->get('/products');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('admin/ProductList')
            ->has('products.data')
            ->has('products.links')
            ->has('products.current_page')
            ->has('sortkey')
            ->has('sortdirection')
        );
        
        // Test with sorting
        $response = $this->actingAs($this->adminUser)
            ->get('/products?sortkey=name&sortdirection=asc');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('sortkey', 'name')
            ->where('sortdirection', 'asc')
        );
        
        // Test with search
        $response = $this->actingAs($this->adminUser)
            ->get('/products?search=Test');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('products.data', 1)
        );
    }



    /**
     * Test cart operations used by cart-related components
     */
    public function test_user_can_add_to_cart()
    {
        $response = $this->actingAs($this->user)
            ->post('/cart/add', [
                'subproduct_id' => $this->subproduct->id,
                'quantity' => 1
            ]);

        $response->assertStatus(200);
        
        // Verify cart item was added
        $this->assertDatabaseHas('cart_items', [
            'subproduct_id' => $this->subproduct->id,
        ]);
    }

    /**
     * Test getting cart items used by cart components
     */
    public function test_user_can_view_cart()
    {
        // First add an item to the cart
        CartItem::factory()->create([
            'cart_id' => $this->cart->id,
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 1
        ]);
        
        $response = $this->actingAs($this->user)->get('/getcartitems');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            '*' => [
                'id',
                'cart_id',
                'subproduct_id',
                'quantity',
                'subproduct' => [
                    'id',
                    'name',
                    'price',
                    'product' => [
                        'id',
                        'name',
                        'description'
                    ]
                ]
            ]
        ]);
    }





    /**
     * Test PDF generation for orders
     */
    public function test_generate_order_pdf()
    {
        $response = $this->actingAs($this->user)
            ->get('/orders/generatepdf/' . $this->order->id);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }
}