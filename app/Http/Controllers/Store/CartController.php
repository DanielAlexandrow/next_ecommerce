<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

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
            $cartItems = $this->cartService->addOrIncrementCartItem(
                $validated['subproduct_id'],
                Auth::id(),
                $validated['quantity']
            );
            
            return response()->json($cartItems, 201)
                ->header('X-Message', 'Added to cart')
                ->header('X-Session-Id', Session::getId());
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function remove(Request $request)
    {
        $validated = $request->validate([
            'subproduct_id' => 'required|exists:subproducts,id'
        ]);

        $cartItems = $this->cartService->removeOrDecrementCartItem(
            $validated['subproduct_id'],
            Auth::id()
        );
        
        return response()->json($cartItems, 201)
            ->header('X-Session-Id', Session::getId());
    }

    public function getCartItems()
    {
        $cartItems = $this->cartService->getCartItems(Auth::id());
        return response()->json($cartItems)
            ->header('X-Session-Id', Session::getId());
    }

    public function getCartWithDeals()
    {
        $cartWithDeals = $this->cartService->getCartWithDeals(Auth::id());
        return response()->json($cartWithDeals);
    }
}
