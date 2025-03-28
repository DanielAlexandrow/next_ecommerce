<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Subproduct;
use App\Models\Deal;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\DealService;

class CartService {
    protected $dealService;
    
    public function __construct(DealService $dealService = null) {
        $this->dealService = $dealService ?? app(DealService::class);
    }
    
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
            // Check subproduct availability and stock
            $subproduct = Subproduct::find($subproductId);
            if (!$subproduct || !$subproduct->available) {
                throw new \Illuminate\Validation\ValidationException(
                    validator([], [])
                        ->errors()
                        ->add('message', 'Product is out of stock')
                );
            }

            $cart = $this->getOrCreateCart($userId);

            $cartItem = $cart->cartItems()
                ->where('subproduct_id', $subproductId)
                ->first();

            $totalQuantity = $quantity;
            if ($cartItem) {
                $totalQuantity += $cartItem->quantity;
            }

            if ($subproduct->stock < $totalQuantity) {
                throw new \Illuminate\Validation\ValidationException(
                    validator([], [])
                        ->errors()
                        ->add('message', 'Not enough stock available')
                );
            }

            if ($cartItem) {
                $cartItem->quantity = $totalQuantity;
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

    public function getCartWithDeals($userId = null) {
        $cart = $this->getOrCreateCart($userId);
        
        if (!$cart) {
            return [
                'items' => [],
                'original_total' => 0,
                'discount_amount' => 0,
                'final_total' => 0,
                'applied_deal' => null
            ];
        }
        
        // Get cart items
        $items = $this->getCartItems($userId);
        
        // Apply deals to cart
        $dealResult = $this->dealService->applyDealsToCart($cart);
        
        return [
            'items' => $items,
            'original_total' => $dealResult['original_total'] ?? $cart->total,
            'discount_amount' => $dealResult['discount_amount'] ?? 0,
            'final_total' => $dealResult['final_total'] ?? $cart->total,
            'applied_deal' => $dealResult['applied_deal'] ?? null
        ];
    }

    protected function mergeCarts(Cart $userCart, Cart $sessionCart) {
        DB::transaction(function () use ($userCart, $sessionCart) {
            // First ensure all items from session cart are properly transferred
            foreach ($sessionCart->cartItems as $item) {
                $existingItem = $userCart->cartItems()
                    ->where('subproduct_id', $item->subproduct_id)
                    ->first();

                if ($existingItem) {
                    // Update existing item quantity
                    $existingItem->update([
                        'quantity' => $existingItem->quantity + $item->quantity
                    ]);
                } else {
                    // Create new cart item in user's cart
                    CartItem::create([
                        'cart_id' => $userCart->id,
                        'subproduct_id' => $item->subproduct_id,
                        'quantity' => $item->quantity
                    ]);
                }
            }

            // Update the total for user's cart
            $this->updateCartTotal($userCart);

            // Delete the session cart and its items
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
