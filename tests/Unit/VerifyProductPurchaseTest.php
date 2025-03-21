<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Subproduct;
use App\Http\Middleware\VerifyProductPurchase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Routing\Route;

class VerifyProductPurchaseTest extends TestCase
{
    use RefreshDatabase;

    private VerifyProductPurchase $middleware;
    private User $user;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new VerifyProductPurchase();
        $this->user = User::factory()->create();
        $this->product = Product::factory()->create();
    }

    public function test_allows_user_with_purchase()
    {
        // Create product and order records
        $subproduct = Subproduct::factory()->create(['product_id' => $this->product->id]);
        $order = Order::factory()->create(['user_id' => $this->user->id]);
        OrderItem::factory()->create([
            'order_id' => $order->id,
            'subproduct_id' => $subproduct->id
        ]);

        // Create request with properly mocked route
        $request = Request::create('/products/' . $this->product->id . '/reviews', 'POST');
        $request->setUserResolver(function () {
            return $this->user;
        });

        // Create a proper route with parameter
        $route = new Route(['POST'], 'products/{product}/reviews', []);
        $route->bind($request);
        $route->setParameter('product', $this->product);

        $request->setRouteResolver(function () use ($route) {
            return $route;
        });

        // Process with middleware
        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(200, $response->status());
    }

    public function test_blocks_user_without_purchase()
    {
        // Create request with properly mocked route but no purchase
        $request = Request::create('/products/' . $this->product->id . '/reviews', 'POST');
        $request->setUserResolver(function () {
            return $this->user;
        });

        // Create a proper route with parameter
        $route = new Route(['POST'], 'products/{product}/reviews', []);
        $route->bind($request);
        $route->setParameter('product', $this->product);

        $request->setRouteResolver(function () use ($route) {
            return $route;
        });

        // Process with middleware
        $response = $this->middleware->handle($request, function ($req) {
            return response()->json(['success' => true]);
        });

        $this->assertEquals(403, $response->status());
        $this->assertStringContainsString('must purchase', $response->getContent());
    }
}
