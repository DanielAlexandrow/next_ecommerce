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
                DB::raw('JSON_LENGTH(orders.items) as item_count'),
                'orders.total',
                'orders.status',
                'orders.created_at',
                'orders.driver_id'
            ])
            ->leftJoin('users', 'users.id', '=', 'orders.user_id')
            ->leftJoin('guests', 'guests.id', '=', 'orders.guest_id')
            ->leftJoin('address_infos as address_info', 'address_info.id', '=', 'guests.id_address_info');
            
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('users.name', 'like', "%{$search}%")
                  ->orWhere('address_info.name', 'like', "%{$search}%")
                  ->orWhere('orders.id', 'like', "%{$search}%");
            });
        }
        
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
