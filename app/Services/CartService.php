<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Support\Facades\DB;

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
            $sessionId = session()->getId();
            
            if ($userId) {
                // First try to find user's cart
                $cart = Cart::where('user_id', $userId)
                    ->where('status', 'active')
                    ->first();
                
                // If no user cart exists, look for a session cart to convert
                if (!$cart) {
                    $sessionCart = Cart::where('session_id', $sessionId)
                        ->where('status', 'active')
                        ->first();
                    
                    if ($sessionCart) {
                        $sessionCart->update([
                            'user_id' => $userId,
                            'session_id' => null
                        ]);
                        return $sessionCart;
                    }
                    
                    // No existing cart found, create new one
                    return Cart::create([
                        'user_id' => $userId,
                        'status' => 'active'
                    ]);
                }
                
                return $cart;
            } else {
                // Guest user - find or create cart by session
                $cart = Cart::where('session_id', $sessionId)
                    ->where('status', 'active')
                    ->first();
                
                if (!$cart) {
                    $cart = Cart::create([
                        'session_id' => $sessionId,
                        'status' => 'active'
                    ]);
                }
                return $cart;
            }
        });
    }

    public function addOrIncrementCartItem($productId, $userId = null, $quantity = 1) {
        $cart = $this->getOrCreateCart($userId);

        return DB::transaction(function () use ($cart, $productId, $quantity) {
            $item = $cart->cartItems()
                ->where('subproduct_id', $productId)
                ->lockForUpdate()
                ->first();

            if ($item) {
                $item->quantity += $quantity;
                $item->save();
            } else {
                $item = CartItem::create([
                    'cart_id' => $cart->id,
                    'subproduct_id' => $productId,
                    'quantity' => $quantity
                ]);
            }

            $item->load('subproduct.product.images');
            
            return [
                'id' => $item->id,
                'cart_id' => $cart->id,
                'subproduct_id' => $productId,
                'quantity' => $item->quantity,
                'subproduct' => $item->subproduct->toArray()
            ];
        });
    }

    public function removeOrDecrementCartItem($productId, $userId = null) {
        $cart = $this->getOrCreateCart($userId);
        if (!$cart) {
            return [];
        }

        return DB::transaction(function () use ($cart, $productId) {
            $cartItem = $cart->cartItems()
                ->where('subproduct_id', $productId)
                ->lockForUpdate()
                ->first();

            if (!$cartItem) {
                return $this->getCartItems($cart->user_id);
            }

            if ($cartItem->quantity > 1) {
                $cartItem->decrement('quantity');
            } else {
                $cartItem->delete();
            }

            return $this->getCartItems($cart->user_id);
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
                    $item->cart_id = $userCart->id;
                    $item->save();
                }
            }
            
            // Delete session cart after merging
            $sessionCart->cartItems()->delete();
            $sessionCart->delete();
        });
    }

    protected function deleteCart(Cart $cart) {
        if (!is_null($cart->user_id)) {
            Session::forget('cart_id');
        }

        $cart->delete();
    }
}
