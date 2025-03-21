<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Guest;
use App\Models\AddressInfo;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Session;

class CheckoutService {
    public function processCheckout($cartId, $data) {
        DB::beginTransaction();

        try {
            $cart = Cart::with(['cartItems.subproduct.product'])
                ->where(function($query) {
                    $query->where('user_id', auth()->id())
                          ->orWhere('session_id', Session::getId());
                })
                ->findOrFail($cartId);

            // Check if cart is empty
            if ($cart->cartItems()->count() === 0) {
                throw ValidationException::withMessages([
                    'cart' => ['Cart is empty']
                ]);
            }

            $userId = $cart->user_id;
            $guestId = null;

            // Handle guest checkout
					'city' => $data['adressData']['city'],
					'country' => $data['adressData']['country'],
					'phone' => $data['adressData']['phone']
				]);

				// Create guest with address info
				$guest = Guest::create([
					'id_address_info' => $addressInfo->id,
					'email' => $data['adressData']['email'],
					'phone' => $data['adressData']['phone']
				]);
				$guestId = $guest->id;
			}

			// Calculate total and prepare items array
			$total = 0;
			$items = [];

			foreach ($cart->cartItems as $cartItem) {
				$subproduct = $cartItem->subproduct;
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

			 // Force delete the cart and its items
            $cart->cartItems()->forceDelete();
            $cart->forceDelete();

			DB::commit();
			return $order;
		} catch (\Exception $e) {
			DB::rollBack();
			throw $e;
		}
	}
}
