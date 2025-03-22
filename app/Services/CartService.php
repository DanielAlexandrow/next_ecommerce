<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Subproduct;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CartService {
    public function getCartItems($userId = null) {
        $cart = $this->getOrCreateCart($userId);
        
        if (!$cart) {
            return [];
        }

        return $cart->cartItems()
            ->with(['subproduct.product.images'])
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'cart_id' => $item->cart_id,
                    'subproduct_id' => $item->subproduct_id,
                    'quantity' => (int)$item->quantity,
                    'subproduct' => $item->subproduct->toArray()
                ];
            })->values()->toArray();
    }

    public function getOrCreateCart($userId = null) {
        return DB::transaction(function () use ($userId) {
            $sessionId = Session::getId();
            
            if ($userId) {
                // First try to find user's cart
                $cart = Cart::where('user_id', $userId)
                    ->where('status', 'active')
                    ->first();
                
                // If no user cart exists, look for a session cart to merge
                if (!$cart) {
                    $sessionCart = Cart::where('session_id', $sessionId)
                        ->where('status', 'active')
                        ->first();
                    
                    // Create new cart for user
                    $cart = Cart::create([
                        'user_id' => $userId,
                        'status' => 'active'
                    ]);

                    // If session cart exists, merge its items
                    if ($sessionCart) {
                        $this->mergeCarts($cart, $sessionCart);
                    }
                }
                
                return $cart;
            } else {
                // Guest user - find or create cart by session
                return Cart::firstOrCreate(
                    [
                        'session_id' => $sessionId,
                        'status' => 'active'
                    ],
                    [
                        'total' => 0,
                        'currency' => 'USD'
                    ]
                );
            }
        });
    }

    public function addOrIncrementCartItem($subproductId, $userId = null, $quantity = 1) {
        return DB::transaction(function () use ($subproductId, $userId, $quantity) {
            $cart = $this->getOrCreateCart($userId);

            $cartItem = $cart->cartItems()
                ->where('subproduct_id', $subproductId)
                ->first();

            if ($cartItem) {
                $cartItem->quantity += $quantity;
                $cartItem->save();
            } else {
                $cartItem = $cart->cartItems()->create([
                    'subproduct_id' => $subproductId,
                    'quantity' => $quantity
                ]);
            }

            // Update cart total
            $this->updateCartTotal($cart);

            return $this->getCartItems($userId);
        });
    }

    public function removeOrDecrementCartItem($subproductId, $userId = null) {
        return DB::transaction(function () use ($subproductId, $userId) {
            $cart = $this->getOrCreateCart($userId);

            $cart->cartItems()
                ->where('subproduct_id', $subproductId)
                ->delete();

            // Update cart total
            $this->updateCartTotal($cart);

            return $this->getCartItems($userId);
        });
    }

    protected function mergeCarts(Cart $userCart, Cart $sessionCart) {
        DB::transaction(function () use ($userCart, $sessionCart) {
            foreach ($sessionCart->cartItems as $item) {
                $existingItem = $userCart->cartItems()
                    ->where('subproduct_id', $item->subproduct_id)
                    ->first();

                if ($existingItem) {
                    $existingItem->quantity += $item->quantity;
                    $existingItem->save();
                } else {
                    CartItem::create([
                        'cart_id' => $userCart->id,
                        'subproduct_id' => $item->subproduct_id,
                        'quantity' => $item->quantity
                    ]);
                }
            }

            $this->updateCartTotal($userCart);

            // Delete session cart after merging
            $sessionCart->cartItems()->delete();
            $sessionCart->delete();
        });
    }

    protected function updateCartTotal(Cart $cart) {
        $total = $cart->cartItems()
            ->join('subproducts', 'cart_items.subproduct_id', '=', 'subproducts.id')
            ->sum(DB::raw('subproducts.price * cart_items.quantity'));
            
        $cart->total = $total;
        $cart->save();
    }

    protected function deleteCart(Cart $cart) {
        DB::transaction(function () use ($cart) {
            $cart->cartItems()->delete();
            $cart->delete();
        });
    }
}
