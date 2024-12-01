<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\OrderService;
use Illuminate\Support\Facades\Auth;

class DriverOrderController extends Controller {
    protected OrderService $orderService;

    public function __construct(OrderService $orderService) {
        $this->middleware(['auth', 'role:driver']);
        $this->orderService = $orderService;
    }

    public function index() {
        $driver = Auth::user();
        $orders = $this->orderService->getOrdersForDriver($driver->id);

        return inertia('Driver/AssignedOrders', [
            'orders' => $orders,
        ]);
    }
}
