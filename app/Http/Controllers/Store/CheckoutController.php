<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Services\CheckoutService;
use App\Services\CartService;
use App\Models\Cart;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class CheckoutController extends Controller
{
    protected $checkoutService;
    protected $cartService;

    public function __construct(CheckoutService $checkoutService, CartService $cartService)
    {
        $this->checkoutService = $checkoutService;
        $this->cartService = $cartService;
    }

    public function checkout(CheckoutRequest $request, $cartId)
    {
        try {
            // Validate that the cart belongs to the current user/session
            $cart = Cart::where('id', $cartId)
                ->where(function ($query) {
                    $query->where('user_id', Auth::id())
                          ->orWhere('session_id', Session::getId());
                })
                ->where('status', 'active')
                ->firstOrFail();

            // Get guest address data if user is not authenticated
            $addressData = !Auth::check() ? $request->validated()['adressData'] : null;
            
            // Process the checkout
            $order = $this->checkoutService->processCheckout($cart, $addressData);
            
            return response()->json(['order' => $order], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'The selected cart id is invalid.',
                'errors' => ['cart_id' => ['The selected cart id is invalid.']]
            ], 422);
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            if ($errorMessage === 'Cart is empty') {
                return response()->json([
                    'message' => 'Cart is empty'
                ], 422);
            }
            
            return response()->json([
                'message' => $errorMessage,
                'errors' => ['general' => [$errorMessage]]
            ], 422);
        }
    }
}
