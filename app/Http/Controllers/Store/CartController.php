<?php

namespace App\Http\Controllers\Store;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\CartService;

class CartController extends Controller {

	protected $cartService;

	public function __construct(CartService $cartService) {
		$this->cartService = $cartService;
	}

	public function index() {

		$userId = auth()->check() ? auth()->user()->id : null;

		$cart = $this->cartService->getCartItems($userId);

		return inertia('store/CartPage', ['cartitems' => $cart]);
	}



	public function add(Request $request) {
		$subproduct_id = $request->input('subproduct_id');
		$userId = auth()->check() ? auth()->user()->id : null;

		$result = $this->cartService->addOrIncrementCartItem($subproduct_id, $userId);
		$cart = $this->cartService->getCartItems($userId);

		if ($result) {
			return response()->json($cart, 201)->header('X-Message', 'Added to cart');
		}
	}


	public function remove(Request $request) {
		$subproduct_id = $request->input('subproduct_id');
		$userId = auth()->check() ? auth()->user()->id : null;

		$this->cartService->removeOrDecrementCartItem($subproduct_id, $userId);
		$cart = $this->cartService->getCartItems($userId);

		if ($cart) {
			return response()->json($cart, 201);
		}
	}


	public function getcartitems() {
		$userId = auth()->check() ? auth()->user()->id : null;

		$cart = $this->cartService->getCartItems($userId);

		return response()->json($cart, 200);
	}
}
