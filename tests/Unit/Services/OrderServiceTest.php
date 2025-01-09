<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class OrderServiceTest extends TestCase {
    use RefreshDatabase;

    private OrderService $orderService;

    protected function setUp(): void {
        parent::setUp();
        $this->orderService = app(OrderService::class);
    }

    public function test_get_orders_for_driver_with_no_orders() {
        // Arrange
        $driver = \App\Models\User::factory()->create();

        // Act
        $orders = $this->orderService->getOrdersForDriver($driver->id);

        // Assert
        $this->assertEmpty($orders);
    }
}
