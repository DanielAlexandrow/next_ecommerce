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

		$cartItems = CartItem::where('cart_id', $cart->id)
			->with('subproduct.product.images')
			->orderBy('subproduct_id', 'asc')
			->get()
			->toArray();


		return $cartItems;
	}


	public function getOrCreateCart($userId = null) {
		$cart = Cart::where(function ($query) use ($userId) {
			if ($userId) {
				$query->where('user_id', $userId);
			} else {
				$cartId = Session::get('cart_id');
				$query->where('id', $cartId);
			}
		})->first();

		if (!$cart) {
			$cart = Cart::create(['user_id' => $userId]);
			if (!$userId) {
				Session::put('cart_id', $cart->id);
			}
		}

		return $cart;
	}


	public function addOrIncrementCartItem($productId, $userId = null) {
		$cart = $this->getOrCreateCart($userId);

		$item = $cart->cartitems()->where('subproduct_id', $productId)->first();

		if ($item) {
			$item->quantity++;
			return $item->save();
		} else {
			CartItem::create(['subproduct_id' => $productId, "cart_id" => $cart->id]);
		}
	}

	public function removeOrDecrementCartItem($productId, $userId = null) {
		$cart = $this->getOrCreateCart($userId);
		if (!$cart) {
			return;
		}

		$cartItem = $cart->cartitems()->where('subproduct_id', $productId)->first();

		if ($cartItem) {
			$cartItem->quantity--;
			$cartItem->save();
			if ($cartItem->quantity === 0) {
				$cartItem->delete();
			}
		}

		return $this->getCartItems($userId);
	}

	protected function deleteCart(Cart $cart) {
		if (!is_null($cart->user_id)) {
			Session::forget('cart_id');
		}

		$cart->delete();
	}
}
