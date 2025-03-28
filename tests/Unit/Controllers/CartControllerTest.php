<?php
namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\Store\CartController;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Subproduct;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\App;
use Illuminate\Session\Store;
use Illuminate\Validation\ValidationException;
use Mockery;
use Inertia\Testing\AssertableInertia as Assert;

class CartControllerTest extends TestCase
{
    private CartController $controller;
    private $cartService;
    private $subproduct;
    private $product;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a proper mock for CartService
        $this->cartService = Mockery::mock(CartService::class);
        $this->instance(CartService::class, $this->cartService);
        
        // Mock Auth facade
        Auth::shouldReceive('check')
            ->andReturn(false)
            ->byDefault();
        
        Auth::shouldReceive('id')
            ->andReturn(null)
            ->byDefault();
            
        // Create controller with mocked service
        $this->controller = new CartController($this->cartService);

        // Create test data
        $this->product = new Product(['name' => 'Test Product']);
        $this->product->id = 1;
        
        $this->subproduct = new Subproduct([
            'name' => 'Test Variant',
            'price' => 99.99,
            'product_id' => $this->product->id,
            'available' => true,
            'stock' => 10
        ]);
        $this->subproduct->id = 1;
    }
    
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }
    
    public function test_index_returns_cart_items()
    {
        // Mock Inertia to test the component name
        $response = $this->controller->index();
        
        // Assert using the component name directly
        $this->assertEquals('store/Cart', $response->getComponent());
    }
    
    public function test_add_validates_request()
    {
        // Create request with invalid data to trigger validation
        $request = new Request();
        
        // Expect the exception
        $this->expectException(ValidationException::class);
        
        // Act
        $this->controller->add($request);
    }
    
    public function test_add_checks_stock_availability()
    {
        // Create a mock request with valid data
        $request = new Request([
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);
        
        // Create a proper mock subproduct that's unavailable
        $unavailableSubproduct = Mockery::mock(Subproduct::class);
        $unavailableSubproduct->shouldReceive('getAttribute')
            ->with('available')
            ->andReturn(false);
        $unavailableSubproduct->shouldReceive('getAttribute')
            ->with('stock')
            ->andReturn(0);
            
        // Mock the Subproduct::find method
        Subproduct::shouldReceive('find')
            ->with($this->subproduct->id)
            ->andReturn($unavailableSubproduct);
        
        // Act
        $response = $this->controller->add($request);
        
        // Assert
        $this->assertEquals(422, $response->status());
        $this->assertEquals('Product is out of stock', $response->getData()->message);
    }
    
    public function test_add_checks_quantity_against_stock()
    {
        // Create a mock request with quantity higher than stock
        $request = new Request([
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 20
        ]);
        
        // Create a proper mock subproduct with limited stock
        $limitedStockSubproduct = Mockery::mock(Subproduct::class);
        $limitedStockSubproduct->shouldReceive('getAttribute')
            ->with('available')
            ->andReturn(true);
        $limitedStockSubproduct->shouldReceive('getAttribute')
            ->with('stock')
            ->andReturn(10);
            
        // Mock the Subproduct::find method
        Subproduct::shouldReceive('find')
            ->with($this->subproduct->id)
            ->andReturn($limitedStockSubproduct);
        
        // Act
        $response = $this->controller->add($request);
        
        // Assert
        $this->assertEquals(422, $response->status());
        $this->assertEquals('Not enough stock available', $response->getData()->message);
    }
    
    public function test_add_item_to_cart_successfully()
    {
        // Create a mock request with valid data
        $request = new Request([
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);
        
        // Create a proper mock subproduct with sufficient stock
        $availableSubproduct = Mockery::mock(Subproduct::class);
        $availableSubproduct->shouldReceive('getAttribute')
            ->with('available')
            ->andReturn(true);
        $availableSubproduct->shouldReceive('getAttribute')
            ->with('stock')
            ->andReturn(10);
            
        // Mock the Subproduct::find method
        Subproduct::shouldReceive('find')
            ->with($this->subproduct->id)
            ->andReturn($availableSubproduct);
        
        // Expected cart items after adding
        $expectedCartItems = [
            [
                'id' => 1,
                'quantity' => 2,
                'subproduct' => [
                    'name' => 'Test Product Variant',
                    'price' => 99.99
                ]
            ]
        ];
        
        // Set expectations for cart service
        $this->cartService->shouldReceive('addOrIncrementCartItem')
            ->once()
            ->with($this->subproduct->id, null, 2)
            ->andReturn(true);
            
        $this->cartService->shouldReceive('getCartItems')
            ->once()
            ->with(null)
            ->andReturn($expectedCartItems);
        
        // Act
        $response = $this->controller->add($request);
        
        // Assert
        $this->assertEquals(201, $response->status());
        $this->assertEquals('Added to cart', $response->headers->get('X-Message'));
        $this->assertEquals($expectedCartItems, $response->getData(true));
    }
    
    public function test_remove_item_from_cart()
    {
        // Create a mock request with valid data
        $request = new Request([
            'subproduct_id' => $this->subproduct->id
        ]);
        
        // Empty cart after removal
        $emptyCartItems = [];
        
        // Set expectations for cart service
        $this->cartService->shouldReceive('removeOrDecrementCartItem')
            ->once()
            ->with($this->subproduct->id, null)
            ->andReturn($emptyCartItems);
        
        // Act
        $response = $this->controller->remove($request);
        
        // Assert
        $this->assertEquals(201, $response->status());
        $this->assertEquals($emptyCartItems, $response->getData(true));
    }
    
    public function test_get_cart_items()
    {
        // Expected cart items
        $expectedCartItems = [
            [
                'id' => 1,
                'quantity' => 2,
                'subproduct' => [
                    'id' => 101,
                    'name' => 'Test Product Variant',
                    'price' => 99.99,
                    'product' => [
                        'name' => 'Test Product',
                        'images' => []
                    ]
                ]
            ]
        ];
        
        // Set expectations for cart service
        $this->cartService->shouldReceive('getCartItems')
            ->once()
            ->with(null)
            ->andReturn($expectedCartItems);
        
        // Act
        $response = $this->controller->getCartItems();
        
        // Assert
        $this->assertEquals(200, $response->status());
        $this->assertEquals($expectedCartItems, $response->getData(true));
    }
    
    public function test_authenticated_user_cart_operations()
    {
        // Mock authenticated user
        Auth::shouldReceive('check')
            ->andReturn(true);
            
        Auth::shouldReceive('id')
            ->andReturn(1);
            
        // Expected cart items
        $expectedCartItems = [
            [
                'id' => 1,
                'quantity' => 2,
                'subproduct' => [
                    'id' => 101,
                    'name' => 'Test Product Variant',
                    'price' => 99.99
                ]
            ]
        ];
        
        // Test add item
        $request = new Request([
            'subproduct_id' => $this->subproduct->id,
            'quantity' => 2
        ]);
        
        // Create a proper mock subproduct with sufficient stock
        $availableSubproduct = Mockery::mock(Subproduct::class);
        $availableSubproduct->shouldReceive('getAttribute')
            ->with('available')
            ->andReturn(true);
        $availableSubproduct->shouldReceive('getAttribute')
            ->with('stock')
            ->andReturn(10);
            
        // Mock the Subproduct::find method
        Subproduct::shouldReceive('find')
            ->with($this->subproduct->id)
            ->andReturn($availableSubproduct);
        
        $this->cartService->shouldReceive('addOrIncrementCartItem')
            ->once()
            ->with($this->subproduct->id, 1, 2)
            ->andReturn(true);
            
        $this->cartService->shouldReceive('getCartItems')
            ->once()
            ->with(1)
            ->andReturn($expectedCartItems);
            
        $response = $this->controller->add($request);
        $this->assertEquals(201, $response->status());
        
        // Test get items
        $this->cartService->shouldReceive('getCartItems')
            ->once()
            ->with(1)
            ->andReturn($expectedCartItems);
            
        $response = $this->controller->getCartItems();
        $this->assertEquals(200, $response->status());
        $this->assertEquals($expectedCartItems, $response->getData(true));
    }
}