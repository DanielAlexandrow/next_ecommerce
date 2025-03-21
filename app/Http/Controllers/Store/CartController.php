<?php

namespace App\Http\Controllers\Store;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\CartService;
use App\Models\Subproduct;
use Illuminate\Support\Facades\Session;

class CartController extends Controller {
    protected $cartService;

    public function __construct(CartService $cartService) {
        $this->cartService = $cartService;
    }

    public function index() {
        $userId = auth()->check() ? auth()->user()->id : null;
        $cartItems = $this->cartService->getCartItems($userId);

        return inertia('store/CartPage', [
            'cartitems' => $cartItems,
            'sessionId' => Session::getId()
        ]);
    }

    public function add(Request $request) {
        $validated = $request->validate([
            'subproduct_id' => 'required|exists:subproducts,id',
            'quantity' => 'required|integer|min:1'
        ]);

        // Check if subproduct is in stock
        $subproduct = Subproduct::find($validated['subproduct_id']);
        if (!$subproduct->available || $subproduct->stock <= 0) {
            return response()->json([
                'message' => 'Product is out of stock',
                'errors' => ['subproduct_id' => ['Product is out of stock']]
            ], 422);
        }

        // Check if requested quantity is available
        if ($validated['quantity'] > $subproduct->stock) {
            return response()->json([
                'message' => 'Not enough stock available',
                'errors' => ['quantity' => ['Requested quantity exceeds available stock']]
            ], 422);
        }

        $userId = auth()->check() ? auth()->user()->id : null;
        
        $this->cartService->addOrIncrementCartItem(
            $validated['subproduct_id'], 
            $userId,
            $validated['quantity']
        );
        
        $items = $this->cartService->getCartItems($userId);
        
        return response()->json(['items' => $items], 201)
            ->header('X-Message', 'Added to cart')
            ->header('X-Session-Id', Session::getId());
    }

    public function remove(Request $request) {
        $validated = $request->validate([
            'subproduct_id' => 'required|exists:subproducts,id'
        ]);
        
        $userId = auth()->check() ? auth()->user()->id : null;
        $items = $this->cartService->removeOrDecrementCartItem(
            $validated['subproduct_id'], 
            $userId
        );

        return response()->json(['items' => $items], 201)
            ->header('X-Session-Id', Session::getId());
    }

    public function getCartItems() {
        $userId = auth()->check() ? auth()->user()->id : null;
        $items = $this->cartService->getCartItems($userId);

        return response()->json(['items' => $items], 200)
            ->header('X-Session-Id', Session::getId());
    }
}
