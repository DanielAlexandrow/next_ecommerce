<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\CartService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CartServiceTest extends TestCase {
    use RefreshDatabase;

    private CartService $cartService;

    protected function setUp(): void {
        parent::setUp();
        $this->cartService = app(CartService::class);
    }

    public function test_get_or_create_cart_for_guest() {
        // Act
        $cart = $this->cartService->getOrCreateCart();

        // Assert
        $this->assertNotNull($cart);
        $this->assertNull($cart->user_id);
    }
}
