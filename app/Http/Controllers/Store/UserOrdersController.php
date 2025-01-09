<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;

class UserOrdersController extends Controller {
	public function index() {
		return Inertia::render('store/OrdersPage');
	}

	public function getUserOrders() {
		try {
			$orders = Order::where('user_id', auth()->id())
				->orderBy('created_at', 'desc')
				->get();

			// Transform orders to include formatted dates and status labels
			$orders = $orders->map(function ($order) {
				return [
					'id' => $order->id,
					'total' => (float) $order->total,
					'status' => $order->status,
					'payment_status' => $order->payment_status,
					'shipping_status' => $order->shipping_status,
					'items' => json_decode($order->items, true),
					'created_at' => $order->created_at->format('Y-m-d H:i:s'),
					'updated_at' => $order->updated_at->format('Y-m-d H:i:s')
				];
			});

			return response()->json($orders);
		} catch (\Exception $e) {
			\Log::error('Failed to fetch orders: ' . $e->getMessage());
			return response()->json(['error' => 'Failed to fetch orders'], 500);
		}
	}

	public function getOrderDetails($orderId) {
		try {
			$order = Order::where('user_id', auth()->id())
				->where('id', $orderId)
				->firstOrFail();

			return response()->json([
				'id' => $order->id,
				'total' => (float) $order->total,
				'status' => $order->status,
				'payment_status' => $order->payment_status,
				'shipping_status' => $order->shipping_status,
				'items' => json_decode($order->items, true),
				'created_at' => $order->created_at->format('Y-m-d H:i:s'),
				'updated_at' => $order->updated_at->format('Y-m-d H:i:s')
			]);
		} catch (\Exception $e) {
			\Log::error('Failed to fetch order details: ' . $e->getMessage());
			return response()->json(['error' => 'Order not found'], 404);
		}
	}
}
