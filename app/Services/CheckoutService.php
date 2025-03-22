<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Guest;
use App\Models\AddressInfo;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CheckoutService {
    public function processCheckout($cartId, $addressData = null) {
        return DB::transaction(function () use ($cartId, $addressData) {
            // Find cart and validate it exists
            $cart = Cart::with(['cartItems.subproduct.product'])
                ->where(function($query) {
                    $query->where('user_id', auth()->id())
                          ->orWhere('session_id', request()->header('X-Session-Id') ?? session()->getId());
                })
                ->where('id', $cartId)
                ->where('status', 'active')
                ->lockForUpdate()
                ->firstOrFail();

            // Check if cart is empty
            if ($cart->cartItems()->count() === 0) {
                throw new \Exception('Cart is empty');
            }

            $userId = $cart->user_id;
            $guestId = null;

            // Handle guest checkout
            if (!$userId && isset($addressData)) {
                // Create address info
                $addressInfo = AddressInfo::create([
                    'name' => $addressData['name'] ?? '',
                    'address' => $addressData['address'],
                    'postal_code' => $addressData['postal_code'],
                    'city' => $addressData['city'],
                    'country' => $addressData['country'],
                    'phone' => $addressData['phone']
                ]);

                // Create guest with address info
                $guest = Guest::create([
                    'id_address_info' => $addressInfo->id,
                    'email' => $addressData['email'],
                    'phone' => $addressData['phone']
                ]);
                $guestId = $guest->id;
            }

            // Calculate total and prepare items array
            $total = 0;
            $items = [];

            foreach ($cart->cartItems as $cartItem) {
                $subproduct = $cartItem->subproduct;
                
                // Verify stock availability
                if (!$subproduct->available || $subproduct->stock < $cartItem->quantity) {
                    throw ValidationException::withMessages([
                        'message' => "Not enough stock available for {$subproduct->name}"
                    ]);
                }

                $itemTotal = $subproduct->price * $cartItem->quantity;
                $total += $itemTotal;

                $items[] = [
                    'product_id' => $subproduct->product->id,
                    'subproduct_id' => $subproduct->id,
                    'quantity' => $cartItem->quantity,
                    'price' => $subproduct->price,
                    'name' => $subproduct->product->name,
                    'variant' => $subproduct->name
                ];

                // Update stock
                $subproduct->decrement('stock', $cartItem->quantity);
            }

            // Create order
            $order = Order::create([
                'user_id' => $userId,
                'guest_id' => $guestId,
                'total' => $total,
                'status' => 'pending',
                'payment_status' => 'pending',
                'shipping_status' => 'pending',
                'items' => json_encode($items)
            ]);

            // Delete the cart and its items
            $cart->cartItems()->delete();
            $cart->delete();

            return $order;
        });
    }
}
