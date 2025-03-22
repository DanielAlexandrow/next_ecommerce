<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\CartService;
use App\Models\Subproduct;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function index()
    {
        $userId = Auth::check() ? Auth::id() : null;
        $cartItems = $this->cartService->getCartItems($userId);
        
        return Inertia::render('Cart/Index', [
            'cartitems' => $cartItems,
            'sessionId' => Session::getId()
        ]);
    }

    public function add(Request $request)
    {
        $validated = $request->validate([
            'subproduct_id' => 'required|exists:subproducts,id',
            'quantity' => 'required|integer|min:1'
        ]);

        try {
            // Validate stock availability
            $subproduct = Subproduct::findOrFail($validated['subproduct_id']);
            if (!$subproduct->available || $subproduct->stock < $validated['quantity']) {
                return response()->json([
                    'message' => 'Product is out of stock',
                    'errors' => ['subproduct_id' => ['Product is out of stock or insufficient quantity available']]
                ], 422);
            }

            $userId = Auth::check() ? Auth::id() : null;
            $cartItems = $this->cartService->addOrIncrementCartItem(
                $validated['subproduct_id'],
                $userId,
                $validated['quantity']
            );

            return response()->json($cartItems, 201)
                ->header('X-Session-Id', session()->getId())
                ->header('X-Message', 'Added to cart');
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error adding item to cart',
                'errors' => ['general' => [$e->getMessage()]]
            ], 422);
        }
    }

    public function remove(Request $request)
    {
        $validated = $request->validate([
            'subproduct_id' => 'required|exists:subproducts,id'
        ]);

        $userId = Auth::check() ? Auth::id() : null;
        $cartItems = $this->cartService->removeOrDecrementCartItem(
            $validated['subproduct_id'], 
            $userId
        );

        return response()->json($cartItems, 201)
            ->header('X-Session-Id', session()->getId());
    }

    public function getCartItems()
    {
        $userId = Auth::check() ? Auth::id() : null;
        $cartItems = $this->cartService->getCartItems($userId);

        return response()->json($cartItems)
            ->header('X-Session-Id', session()->getId());
    }
}
