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

class AdminOrders extends Controller {
    protected $orderService;
    
    public function __construct(OrderService $orderService = null) {
        $this->middleware('admin')->except(['generatePdf']); 
        $this->middleware('auth')->only(['generatePdf']);
        $this->orderService = $orderService ?? new OrderService();
    }

    public function index(Request $request) {
        $sortKey = $request->input('sortkey', 'orders.id');
        $sortDirection = $request->input('sortdirection', 'desc');
        $search = $request->input('search', '');
        $driverId = $request->input('driver_id', null);

        $query = Order::query()
            ->select([
                'orders.id as order_id',
                DB::raw('COALESCE(users.name, address_info.name, "N/A") as name'),
                DB::raw('(LENGTH(orders.items) - LENGTH(REPLACE(orders.items, \',\', \'\')) + 1) as item_count'),
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
        
        // Filter by driver if requested
        if ($driverId) {
            $query->where('orders.driver_id', $driverId);
        }
        
        // If the current user is a driver, only show their orders
        if (auth()->check() && auth()->user()->role === 'driver') {
            $query->where('orders.driver_id', auth()->id());
        }

        $orders = $query->orderBy($sortKey, $sortDirection)->paginate(10);

        if ($request->wantsJson()) {
            return response()->json($orders);
        }

        // Get the list of drivers for the dropdown
        $drivers = User::where('role', 'driver')->select('id', 'name')->get();

        return Inertia::render('admin/Orders', [
            'orders' => $orders,
            'sortkey' => $sortKey,
            'sortdirection' => $sortDirection,
            'drivers' => $drivers
        ]);
    }

    public function getOrderDetails($order_id) {
        $order = Order::with(['user', 'guest.addressInfo', 'driver'])->findOrFail($order_id);
        $customer = $order->user ?? ($order->guest ? [
            'id' => $order->guest->id,
            'name' => $order->guest->addressInfo->name ?? 'N/A',
            'email' => $order->guest->email ?? 'N/A',
            'address' => $order->guest->addressInfo
        ] : null);
        
        return response()->json([
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
        ]);
    }

    public function updateStatus(Request $request, Order $order) {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,processing,completed,cancelled',
            'payment_status' => 'required|in:pending,paid,refunded',
            'shipping_status' => 'required|in:pending,shipped,delivered',
            'driver_id' => 'nullable|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $order->update($request->only(['status', 'payment_status', 'shipping_status', 'driver_id']));

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }

    public function generatePdf($orderId) {
        try {
            $order = Order::with(['user', 'guest.addressInfo'])->findOrFail($orderId);
            
            // Allow admin or the order owner to access PDF
            if (!auth()->user()->isAdmin() && auth()->id() !== $order->user_id) {
                return response()->json(['message' => 'Unauthorized access to order PDF'], 403);
            }
            
            $items = is_string($order->items) ? json_decode($order->items, true) : $order->items;
            $customer = $order->user ?? ($order->guest ? [
                'name' => $order->guest->addressInfo->name ?? 'N/A',
                'email' => $order->guest->email ?? 'N/A',
                'address' => $order->guest->addressInfo
            ] : null);
            
            $data = [
                'order' => $order,
                'items' => $items,
                'customer' => $customer,
                'date' => $order->created_at->format('Y-m-d'),
                'invoice_no' => sprintf('INV-%06d', $order->id)
            ];

            $pdf = PDF::loadView('pdf.invoice', $data);
            
            return $pdf->stream('invoice-' . $order->id . '.pdf');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Order not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to generate PDF'], 500);
        }
    }
}
