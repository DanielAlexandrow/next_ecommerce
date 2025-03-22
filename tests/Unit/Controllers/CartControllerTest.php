<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\Store\CartController;
use App\Services\CartService;
use App\Models\Subproduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Validator;
use Mockery;

class CartControllerTest extends TestCase
{
    private CartController $controller;
    private $cartService;
    private $sessionId = 'test-session-id';

    protected function setUp(): void
    {
        parent::setUp();
        $this->cartService = Mockery::mock(CartService::class);
        $this->controller = new CartController($this->cartService);
        
        // Set up consistent session mocking
        Session::shouldReceive('getId')
            ->andReturn($this->sessionId);
    }

    protected function tearDown(): void
    {
        parent::tearDown();
        Mockery::close();
    }

    public function test_index_returns_cart_items()
    {
        // Arrange
        $expectedCartItems = [
            ['id' => 1, 'quantity' => 2],
            ['id' => 2, 'quantity' => 1]
        ];
        
        // Mock the auth check
        Auth::shouldReceive('check')->once()->andReturn(false);
        
        $this->cartService->shouldReceive('getCartItems')
            ->once()
            ->with(null)
            ->andReturn($expectedCartItems);
            
        // Act
        $response = $this->controller->index();
        
        // Assert
        $this->assertInstanceOf(\Inertia\Response::class, $response);
        
        $responseReflection = new \ReflectionClass($response);
        $propsProperty = $responseReflection->getProperty('props');
        $propsProperty->setAccessible(true);
        $props = $propsProperty->getValue($response);
        
        $this->assertEquals($expectedCartItems, $props['cartitems']);
        $this->assertEquals($this->sessionId, $props['sessionId']);
    }

    public function test_add_validates_request()
    {
        // Create mock validator with error messages
        $mockValidator = Mockery::mock(Validator::class);
        $mockValidator->shouldReceive('errors->all')
            ->andReturn(['The subproduct_id field is required']);
            
        // Create a properly structured ValidationException
        $exception = ValidationException::withMessages([
            'subproduct_id' => 'The subproduct_id field is required',
            'quantity' => 'The quantity must be at least 1'
        ]);
        
        // Create a mock request
        $request = Mockery::mock(Request::class);
        $request->shouldReceive('validate')
            ->once()
            ->andThrow($exception);
        
        // Expect the exception
        $this->expectExceptionObject($exception);
        
        // Act
        $this->controller->add($request);
    }

    public function test_add_checks_stock_availability()
    {
        // Create a mock request with proper validated method
        $request = Mockery::mock(Request::class);
        $request->shouldReceive('validate')
            ->once()
            ->andReturn(['subproduct_id' => 1, 'quantity' => 5]);
            
        $request->shouldReceive('validated')
            ->once()
            ->andReturn(['subproduct_id' => 1, 'quantity' => 5]);
        
        // Create a proper mock instance for Subproduct
        $subproduct = Mockery::mock('stdClass');
        $subproduct->available = false;
        $subproduct->stock = 0;
        
        // Use instance method to bind the mock to the container
        $this->instance(Subproduct::class, Mockery::mock(Subproduct::class, function ($mock) use ($subproduct) {
            $mock->shouldReceive('find')->with(1)->andReturn($subproduct);
        }));
        
        // Act
        $response = $this->controller->add($request);
        
        // Assert
        $this->assertEquals(422, $response->status());
        $this->assertEquals('Product is out of stock', $response->getData()->message);
    }

    public function test_add_checks_quantity_against_stock()
    {
        // Create a mock request with proper validated method
        $request = Mockery::mock(Request::class);
        $request->shouldReceive('validate')
            ->once()
            ->andReturn(['subproduct_id' => 1, 'quantity' => 10]);
            
        $request->shouldReceive('validated')
            ->once()
            ->andReturn(['subproduct_id' => 1, 'quantity' => 10]);
        
        // Create a proper mock instance for Subproduct
        $subproduct = Mockery::mock('stdClass');
        $subproduct->available = true;
        $subproduct->stock = 5;
        
        // Use instance method to bind the mock to the container
        $this->instance(Subproduct::class, Mockery::mock(Subproduct::class, function ($mock) use ($subproduct) {
            $mock->shouldReceive('find')->with(1)->andReturn($subproduct);
        }));
        
        // Act
        $response = $this->controller->add($request);
        
        // Assert
        $this->assertEquals(422, $response->status());
        $this->assertEquals('Not enough stock available', $response->getData()->message);
    }

    public function test_add_item_to_cart_successfully()
    {
        // Mock authentication check
        Auth::shouldReceive('check')->once()->andReturn(false);
        
        // Create a mock request with proper validated method
        $request = Mockery::mock(Request::class);
        $request->shouldReceive('validate')
            ->once()
            ->andReturn(['subproduct_id' => 1, 'quantity' => 2]);
            
        $request->shouldReceive('validated')
            ->once()
            ->andReturn(['subproduct_id' => 1, 'quantity' => 2]);
        
        // Create a proper mock instance for Subproduct
        $subproduct = Mockery::mock('stdClass');
        $subproduct->available = true;
        $subproduct->stock = 5;
        
        // Use instance method to bind the mock to the container
        $this->instance(Subproduct::class, Mockery::mock(Subproduct::class, function ($mock) use ($subproduct) {
            $mock->shouldReceive('find')->with(1)->andReturn($subproduct);
        }));
            
        $expectedCartItems = [
            ['id' => 1, 'quantity' => 2]
        ];
        
        $this->cartService->shouldReceive('addOrIncrementCartItem')
            ->once()
            ->with(1, null, 2);
            
        $this->cartService->shouldReceive('getCartItems')
            ->once()
            ->with(null)
            ->andReturn($expectedCartItems);
        
        // Act
        $response = $this->controller->add($request);
        
        // Assert
        $this->assertEquals(201, $response->status());
        $this->assertEquals($expectedCartItems, $response->getData(true));
        $this->assertEquals('Added to cart', $response->headers->get('X-Message'));
        $this->assertEquals($this->sessionId, $response->headers->get('X-Session-Id'));
    }

    public function test_remove_item_from_cart()
    {
        // Mock authentication check
        Auth::shouldReceive('check')->once()->andReturn(false);
        
        // Create a mock request with proper validated method
        $request = Mockery::mock(Request::class);
        $request->shouldReceive('validate')
            ->once()
            ->andReturn(['subproduct_id' => 1]);
            
        $request->shouldReceive('validated')
            ->once()
            ->andReturn(['subproduct_id' => 1]);
        
        $expectedCartItems = [];
        
        $this->cartService->shouldReceive('removeOrDecrementCartItem')
            ->once()
            ->with(1, null)
            ->andReturn($expectedCartItems);
        
        // Act
        $response = $this->controller->remove($request);
        
        // Assert
        $this->assertEquals(201, $response->status());
        $this->assertEquals($expectedCartItems, $response->getData(true));
        $this->assertEquals($this->sessionId, $response->headers->get('X-Session-Id'));
    }

    public function test_get_cart_items()
    {
        // Mock authentication check
        Auth::shouldReceive('check')->once()->andReturn(false);
        
        $expectedCartItems = [
            ['id' => 1, 'quantity' => 2],
            ['id' => 2, 'quantity' => 1]
        ];
        
        $this->cartService->shouldReceive('getCartItems')
            ->once()
            ->with(null)
            ->andReturn($expectedCartItems);
        
        // Act
        $response = $this->controller->getCartItems();
        
        // Assert
        $this->assertEquals(200, $response->status());
        $this->assertEquals($expectedCartItems, $response->getData(true));
        $this->assertEquals($this->sessionId, $response->headers->get('X-Session-Id'));
    }
}