<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class OrderService {
    /**
     * Get orders with pagination and filtering
     * 
     * @param array $params
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getOrders(array $params = []) {
        $sortKey = $params['sortkey'] ?? 'orders.id';
        $sortDirection = $params['sortdirection'] ?? 'desc';
        $search = $params['search'] ?? '';
        $driverId = $params['driver_id'] ?? null;

        $query = Order::query()
            ->select([
                'orders.id as order_id',
                DB::raw('COALESCE(users.name, address_info.name, "N/A") as name'),
                'orders.total',
                'orders.status',
                'orders.payment_status',
                'orders.shipping_status',
                'orders.created_at',
                DB::raw('(LENGTH(orders.items) - LENGTH(REPLACE(orders.items, \',\', \'\')) + 1) as item_count')
            ])
            ->leftJoin('users', 'orders.user_id', '=', 'users.id')
            ->leftJoin('guests', 'orders.guest_id', '=', 'guests.id')
            ->leftJoin('address_infos as address_info', 'address_info.id', '=', 'guests.id_address_info');

        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('orders.id', 'like', "%{$search}%")
                  ->orWhere('users.name', 'like', "%{$search}%")
                  ->orWhere('guests.email', 'like', "%{$search}%")
                  ->orWhere('address_info.name', 'like', "%{$search}%");
            });
        }

        // Apply status filters
        if (!empty($params['orderStatus'])) {
            $query->where('orders.status', $params['orderStatus']);
        }
        if (!empty($params['paymentStatus'])) {
            $query->where('orders.payment_status', $params['paymentStatus']);
        }
        if (!empty($params['shippingStatus'])) {
            $query->where('orders.shipping_status', $params['shippingStatus']);
        }

        // Apply date range filter
        if (!empty($params['from'])) {
            $query->whereDate('orders.created_at', '>=', $params['from']);
        }
        if (!empty($params['to'])) {
            $query->whereDate('orders.created_at', '<=', $params['to']);
        }

        // Apply total amount range filter
        if (!empty($params['minTotal'])) {
            $query->where('orders.total', '>=', $params['minTotal']);
        }
        if (!empty($params['maxTotal'])) {
            $query->where('orders.total', '<=', $params['maxTotal']);
        }

        // Apply driver filter if specified
        if ($driverId) {
            $query->where('orders.driver_id', $driverId);
        }

        // If the current user is a driver, only show their orders
        if (isset($params['user_id']) && isset($params['user_role']) && $params['user_role'] === 'driver') {
            $query->where('orders.driver_id', $params['user_id']);
        }

        return $query->orderBy($sortKey, $sortDirection)->paginate(10);
    }
    
    /**
     * Get order details
     * 
     * @param int $orderId
     * @return array
     */
    public function getOrderDetails($orderId) {
        $order = Order::with(['user', 'guest.addressInfo', 'driver'])->findOrFail($orderId);
        $customer = $order->user ?? ($order->guest ? [
            'id' => $order->guest->id,
            'name' => $order->guest->addressInfo->name ?? 'N/A',
            'email' => $order->guest->email ?? 'N/A',
            'address' => $order->guest->addressInfo
        ] : null);
        
        return [
            'order' => $order,
            'customer' => $customer,
            'items' => json_decode($order->items),
            'total' => $order->total,
            'status' => [
                'order' => $order->status,
                'payment' => $order->payment_status,
                'shipping' => $order->shipping_status
            ],
            'driver' => $order->driver
        ];
    }
    
    /**
     * Update order status
     * 
     * @param Order $order
     * @param array $data
     * @return Order
     */
    public function updateStatus(Order $order, array $data) {
        $order->update($data);
        return $order;
    }

    public function getOrdersForDriver(int $driverId) {
        return Order::where('driver_id', $driverId)
            ->with(['orderItems.product', 'customer.addressInfo'])
            ->get();
    }
}
