<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Guest;
use App\Models\AddressInfo;
use Illuminate\Support\Facades\DB;

class CheckoutService
{
	public function processCheckout($cartId, $data)
	{
		DB::beginTransaction();

		try {
			$cart = Cart::with('cartItems')->findOrFail($cartId);
			$userId = $cart->user_id;
			$guestId = null;

			if (auth()->guest()) {
				$guest = Guest::create([
					'id_address_info' => AddressInfo::create($data['adressData'])->id,
				]);
				$guestId = $guest->id;
			}

			$order = Order::create([
				'user_id' => $userId,
				'guest_id' => $guestId,
			]);

			foreach ($cart->cartItems as $cartItem) {
				OrderItem::create([
					'order_id' => $order->id,
					'subproduct_id' => $cartItem->subproduct_id,
					'quantity' => $cartItem->quantity,
				]);
			}

			$cart->cartItems()->delete();

			DB::commit();
			return $order;
		} catch (\Exception $e) {
			DB::rollBack();
			throw $e;
		}
	}
}
