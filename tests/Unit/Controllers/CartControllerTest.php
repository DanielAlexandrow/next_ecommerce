<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Http\Controllers\Store\CartController;
use App\Services\CartService;
use App\Models\Subproduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Mockery;

class CartControllerTest extends TestCase
{
    private CartController $controller;
    private $cartService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->cartService = Mockery::mock(CartService::class);
        $this->controller = new CartController($this->cartService);
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
        $sessionId = 'test-session-id';

        Session::shouldReceive('getId')
            ->once()
            ->andReturn($sessionId);

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
        $this->assertEquals($sessionId, $props['sessionId']);
    }

    public function test_add_validates_request()
    {
        // Arrange
        $request = new Request();
        $request->merge([
            'subproduct_id' => '',
            'quantity' => 0
        ]);

        // Act
        $response = $this->controller->add($request);

        // Assert
        $this->assertEquals(422, $response->status());
        $this->assertArrayHasKey('subproduct_id', $response->getData()->errors);
        $this->assertArrayHasKey('quantity', $response->getData()->errors);
    }

    public function test_add_checks_stock_availability()
    {
        // Arrange
        $request = new Request();
        $request->merge([
            'subproduct_id' => 1,
            'quantity' => 5
        ]);

        $subproduct = Mockery::mock(Subproduct::class);
        $subproduct->available = false;
        $subproduct->stock = 0;

        Subproduct::shouldReceive('find')
            ->with(1)
            ->andReturn($subproduct);

        // Act
        $response = $this->controller->add($request);

        // Assert
        $this->assertEquals(422, $response->status());
        $this->assertEquals('Product is out of stock', $response->getData()->message);
    }

    public function test_add_checks_quantity_against_stock()
    {
        // Arrange
        $request = new Request();
        $request->merge([
            'subproduct_id' => 1,
            'quantity' => 10
        ]);

        $subproduct = Mockery::mock(Subproduct::class);
        $subproduct->available = true;
        $subproduct->stock = 5;

        Subproduct::shouldReceive('find')
            ->with(1)
            ->andReturn($subproduct);

        // Act
        $response = $this->controller->add($request);

        // Assert
        $this->assertEquals(422, $response->status());
        $this->assertEquals('Not enough stock available', $response->getData()->message);
    }

    public function test_add_item_to_cart_successfully()
    {
        // Arrange
        $request = new Request();
        $request->merge([
            'subproduct_id' => 1,
            'quantity' => 2
        ]);

        $subproduct = Mockery::mock(Subproduct::class);
        $subproduct->available = true;
        $subproduct->stock = 5;

        $expectedCartItems = [
            ['id' => 1, 'quantity' => 2]
        ];

        $sessionId = 'test-session-id';

        Subproduct::shouldReceive('find')
            ->with(1)
            ->andReturn($subproduct);

        Session::shouldReceive('getId')
            ->once()
            ->andReturn($sessionId);

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
        $this->assertEquals($expectedCartItems, $response->getData()->items);
        $this->assertEquals('Added to cart', $response->headers->get('X-Message'));
        $this->assertEquals($sessionId, $response->headers->get('X-Session-Id'));
    }

    public function test_remove_item_from_cart()
    {
        // Arrange
        $request = new Request();
        $request->merge(['subproduct_id' => 1]);

        $expectedCartItems = [];
        $sessionId = 'test-session-id';

        Session::shouldReceive('getId')
            ->once()
            ->andReturn($sessionId);

        $this->cartService->shouldReceive('removeOrDecrementCartItem')
            ->once()
            ->with(1, null)
            ->andReturn($expectedCartItems);

        // Act
        $response = $this->controller->remove($request);

        // Assert
        $this->assertEquals(201, $response->status());
        $this->assertEquals($expectedCartItems, $response->getData()->items);
        $this->assertEquals($sessionId, $response->headers->get('X-Session-Id'));
    }

    public function test_get_cart_items()
    {
        // Arrange
        $expectedCartItems = [
            ['id' => 1, 'quantity' => 2],
            ['id' => 2, 'quantity' => 1]
        ];
        $sessionId = 'test-session-id';

        Session::shouldReceive('getId')
            ->once()
            ->andReturn($sessionId);

        $this->cartService->shouldReceive('getCartItems')
            ->once()
            ->with(null)
            ->andReturn($expectedCartItems);

        // Act
        $response = $this->controller->getcartitems();

        // Assert
        $this->assertEquals(200, $response->status());
        $this->assertEquals($expectedCartItems, $response->getData()->items);
        $this->assertEquals($sessionId, $response->headers->get('X-Session-Id'));
    }
}