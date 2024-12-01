<?php

namespace App\Services;

use App\Models\Order;

class OrderService {
    public function getOrdersForDriver(int $driverId) {
        return Order::where('driver_id', $driverId)
            ->with(['orderItems.product', 'customer.addressInfo'])
            ->get();
    }
}
