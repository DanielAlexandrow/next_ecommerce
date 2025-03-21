<?php

namespace App\Http\Controllers\Store;

use App\Http\Requests\CheckoutRequest;
use App\Services\CheckoutService;
use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    protected $checkoutService;

    public function __construct(CheckoutService $checkoutService)
    {
        $this->checkoutService = $checkoutService;
    }

    public function checkout($cartId, CheckoutRequest $request)
    {
        DB::beginTransaction();
        try {
            // Find cart and eager load relationships
            $cart = Cart::with(['cartItems.subproduct.product'])
                ->where(function($query) {
                    $query->where('user_id', auth()->id())
                          ->orWhere('session_id', session()->getId());
                })
                ->findOrFail($cartId);

            // Check cart belongs to current user/session
            if ($cart->user_id !== auth()->id() && $cart->session_id !== session()->getId()) {
                return response()->json([
                    'message' => 'Cart not found',
                    'errors' => ['cart_id' => ['Invalid cart']]
                ], 422);
            }
            
            // Validate cart is not empty
            if ($cart->cartItems()->count() === 0) {
                return response()->json([
                    'message' => 'Cart is empty'
                ], 422);
            }

            $order = $this->checkoutService->processCheckout($cart, $request->validated());
            
            DB::commit();
            return response()->json(['order' => $order], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => method_exists($e, 'errors') ? $e->errors() : null
            ], 422);
        }
    }
}
