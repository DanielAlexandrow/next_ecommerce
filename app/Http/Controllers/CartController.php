<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CartService;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Subproduct;

class CartController extends Controller {
    protected $cartService;

    public function __construct(CartService $cartService) {
        $this->cartService = $cartService;
    }

    public function index() {
        $items = $this->cartService->getCartItems(auth()->id());
        return response()->json($items);
    }

    public function getCartItems() {
        $items = $this->cartService->getCartItems(auth()->id());
        return response()->json($items);
    }

    public function add(Request $request) {
        $validated = $request->validate([
            'subproduct_id' => 'required|exists:subproducts,id',
            'quantity' => 'required|integer|min:1'
        ]);

        // Validate stock availability
        $subproduct = Subproduct::findOrFail($validated['subproduct_id']);
        if ($subproduct->stock < $validated['quantity']) {
            return response()->json([
                'errors' => ['subproduct_id' => ['Not enough stock available']]
            ], 422);
        }

        // Add item and return updated cart items
        $cartItems = $this->cartService->addOrIncrementCartItem(
            $validated['subproduct_id'],
            auth()->id(),
            $validated['quantity']
        );

        return response()->json($cartItems, 201)
            ->header('X-Session-Id', session()->getId());
    }

    public function remove(Request $request) {
        $validated = $request->validate([
            'subproduct_id' => 'required|exists:subproducts,id'
        ]);

        $cartItems = $this->cartService->removeOrDecrementCartItem($validated['subproduct_id'], auth()->id());
        return response()->json($cartItems, 201);
    }
}
