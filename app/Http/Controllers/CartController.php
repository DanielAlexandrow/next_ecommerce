<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\CartService;

class CartController extends Controller {
    protected $cartService;

    public function __construct(CartService $cartService) {
        $this->cartService = $cartService;
    }

    public function index() {
        return response()->json([
            'cart' => $this->cartService->getCurrentCart()
        ]);
    }

    public function add(Request $request) {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = $this->cartService->addToCart($validated['product_id'], $validated['quantity']);

        return response()->json([
            'message' => 'Product added to cart',
            'cart' => $cart
        ]);
    }

    public function remove(Request $request) {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $cart = $this->cartService->removeFromCart($validated['product_id']);

        return response()->json([
            'message' => 'Product removed from cart',
            'cart' => $cart
        ]);
    }
}
