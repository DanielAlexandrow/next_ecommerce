<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;

class AdminOrders extends Controller {
    public function index() {
        $orders = Order::with(['user', 'guest'])->paginate(10);
        return response()->json($orders);
    }

    public function getOrderDetails($order_id) {
        $order = Order::with(['user', 'guest'])->findOrFail($order_id);
        return response()->json([
            'order' => $order,
            'customer' => $order->user ?? $order->guest,
            'items' => json_decode($order->items),
            'total' => $order->total,
            'status' => [
                'order' => $order->status,
                'payment' => $order->payment_status,
                'shipping' => $order->shipping_status
            ]
        ]);
    }

    public function updateStatus(Request $request, Order $order) {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,completed,cancelled',
            'payment_status' => 'required|in:pending,paid,refunded',
            'shipping_status' => 'required|in:pending,shipped,delivered'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order->update($request->only(['status', 'payment_status', 'shipping_status']));

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }

    public function generatePdf($orderId) {
        $order = Order::with(['user', 'guest'])->findOrFail($orderId);
        $items = json_decode($order->items, true);
        $customer = $order->user ?? $order->guest;
        
        $data = [
            'order' => $order,
            'items' => $items,
            'customer' => $customer,
            'date' => $order->created_at->format('Y-m-d'),
            'invoice_no' => sprintf('INV-%06d', $order->id)
        ];

        $pdf = PDF::loadView('pdf.invoice', $data);
        
        return $pdf->download('invoice-' . $order->id . '.pdf');
    }
}
