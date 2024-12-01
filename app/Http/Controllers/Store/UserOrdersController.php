<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Support\Facades\Auth;

class UserOrdersController extends Controller {
	public function index() {
		$orders = Order::where('user_id', Auth::id())
			->with(['orderItems.subproduct.product'])
			->orderBy('created_at', 'desc')
			->get();

		return inertia('store/UserOrders', [
			'orders' => $orders
		]);
	}

	public function getOrderDetails($orderId) {
		$order = Order::where('id', $orderId)
			->where('user_id', Auth::id())
			->with([
				'orderItems.subproduct.product',
				'user.addressInfo'
			])
			->firstOrFail();

		return response()->json([
			'items' => $order->orderItems,
			'customer' => $order->user,
			'customerRegistered' => true
		]);
	}
}
