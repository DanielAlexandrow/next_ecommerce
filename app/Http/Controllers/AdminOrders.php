<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminOrders extends Controller {
	public function index(Request $request) {
		$sortKey = $request->get('sortkey', 'orders.id');
		$sortDirection = $request->get('sortdirection', 'asc');
		$limit = $request->input('limit', 10);
		$search = $request->input('search');

		$query = Order::query()
			->leftJoin('guests', function ($join) {
				$join->on('guests.id', '=', DB::raw('CAST(orders.guest_id AS BIGINT)'));
			})
			->leftJoin('address_infos as ai_guests', 'guests.id_address_info', '=', 'ai_guests.id')
			->leftJoin('users', 'users.id', '=', 'orders.user_id')
			->leftJoin('address_infos as ai_users', 'users.id_address_info', '=', 'ai_users.id')
			->leftJoin('order_items', 'order_items.order_id', '=', 'orders.id');

		if (!empty($search)) {
			$searchTerm = strtolower($search);
			$query->where(function ($q) use ($searchTerm) {
				$q->whereRaw('LOWER(ai_guests.name) LIKE ?', ['%' . $searchTerm . '%'])
					->orWhereRaw('LOWER(ai_users.name) LIKE ?', ['%' . $searchTerm . '%']);
			});
		}

		$query->select([
			'orders.id as order_id',
			DB::raw('COALESCE(ai_guests.name, ai_users.name) as name'),
			DB::raw('COUNT(DISTINCT order_items.id) as item_count')
		])
			->groupBy('orders.id', 'ai_guests.name', 'ai_users.name');

		if ($sortKey === 'item_count') {
			$query->orderByRaw('COUNT(DISTINCT order_items.id) ' . $sortDirection);
		} else {
			$query->orderBy($sortKey, $sortDirection);
		}

		$results = $query->paginate($limit);

		return inertia('admin/Orders', [
			'orders' => $results,
			'sortkey' => $sortKey,
			'sortdirection' => $sortDirection,
		]);
	}

	private function getCustomerInfos($orderId) {
		$order = Order::with(['guest.addressInfo', 'user.addressInfo'])
			->findOrFail($orderId);

		$customerRegistered = !$order->guest_id;
		$customer = $customerRegistered ? $order->user : $order->guest;

		return [
			'customer' => $customer,
			'customerRegistered' => $customerRegistered
		];
	}

	public function getOrderDetails($id) {
		$items = OrderItem::where('order_id', $id)
			->with(['subproduct.product'])
			->get();

		$customerInfo = $this->getCustomerInfos($id);

		return response()->json([
			'items' => $items,
			'customer' => $customerInfo['customer'],
			'customerRegistered' => $customerInfo['customerRegistered'],
		]);
	}

	public function generatePdf($orderId) {
		$customerInfo = $this->getCustomerInfos($orderId);
		$items = OrderItem::where('order_id', $orderId)
			->with(['subproduct.product'])
			->get();

		$data = [
			'customer' => $customerInfo['customer'],
			'items' => $items,
			'websiteName' => "Template.com",
			'orderId' => $orderId,
			'websiteShopAdress' => "Bulevard, 1000 , Sofia",
			'websiteEmail' => "lQwK8@example.com",
			'websitePhone' => "123456789"
		];

		$pdf = Pdf::loadView('invoice', $data);
		return $pdf->download("order_{$orderId}_invoice.pdf");
	}
}
