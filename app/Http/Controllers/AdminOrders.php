<?php

namespace App\Http\Controllers;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Services\OrderService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\View;
use Dompdf\Dompdf;

class AdminOrders extends Controller {
    protected $orderService;
    
    public function __construct(OrderService $orderService = null) {
        $this->middleware('admin')->except(['generatePdf']); 
        $this->middleware('auth')->only(['generatePdf']);
        $this->orderService = $orderService ?? new OrderService();
    }

    private function validateOrderId($orderId): ?string {
        if (!$orderId) {
            return 'Order ID is required';
        }
        if (!is_numeric($orderId)) {
            return 'Order ID must be numeric';
        }
        return null;
    }

    private function validateOrderStatus($status): ?string {
        if (!$status) {
            return 'Order status is required';
        }
        $validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
        if (!in_array($status, $validStatuses)) {
            return "Invalid order status. Must be one of: " . implode(', ', $validStatuses);
        }
        return null;
    }

    public function index(Request $request) {
        $params = [
            'sortkey' => $request->input('sortkey', 'orders.id'),
            'sortdirection' => $request->input('sortdirection', 'desc'),
            'search' => $request->input('search'),
            'orderStatus' => $request->input('orderStatus'),
            'paymentStatus' => $request->input('paymentStatus'),
            'shippingStatus' => $request->input('shippingStatus'),
            'from' => $request->input('from'),
            'to' => $request->input('to'),
            'minTotal' => $request->input('minTotal'),
            'maxTotal' => $request->input('maxTotal'),
            'driver_id' => $request->input('driver_id'),
        ];

        if (auth()->user()->role === 'driver') {
            $params['user_id'] = auth()->id();
            $params['user_role'] = 'driver';
        }

        $orders = $this->orderService->getOrders($params);

        return inertia('admin/Orders', [
            'orders' => $orders,
            'sortkey' => $params['sortkey'],
            'sortdirection' => $params['sortdirection'],
            'filters' => [
                'search' => $params['search'],
                'orderStatus' => $params['orderStatus'],
                'paymentStatus' => $params['paymentStatus'],
                'shippingStatus' => $params['shippingStatus'],
                'from' => $params['from'],
                'to' => $params['to'],
                'minTotal' => $params['minTotal'],
                'maxTotal' => $params['maxTotal']
            ]
        ]);
    }

    public function getOrderDetails($orderId) {
        $order = Order::with(['orderItems.subproduct.product'])
            ->findOrFail($orderId);
            
        $customer = $order->user ?? $order->guest;
        
        return response()->json([
            'order' => $order,
            'customer' => $customer,
            'items' => $order->orderItems,
            'total' => $order->total,
            'status' => $order->status
        ]);
    }

    public function updateStatus(Request $request, $orderId) {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,completed,cancelled',
            'payment_status' => 'required|in:pending,paid,failed',
            'shipping_status' => 'required|in:pending,shipped,delivered'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order = Order::findOrFail($orderId);
        $order->update($validator->validated());

        return response()->json($order);
    }

    public function generatePdf($orderId) {
        $order = Order::with(['orderItems.subproduct.product'])
            ->findOrFail($orderId);
            
        // Check authorization
        if (auth()->user()->role !== 'admin' && 
            auth()->id() !== $order->user_id && 
            !auth()->user()->can('view', $order)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $pdf = PDF::loadView('pdfs.order', [
            'order' => $order,
            'customer' => $order->user ?? $order->guest,
            'items' => $order->orderItems,
        ]);

        return $pdf->stream("order-{$orderId}.pdf");
    }
}
