<?php

namespace App\Http\Controllers\Store;

use App\Http\Requests\CheckoutRequest;
use App\Services\CheckoutService;
use App\Http\Controllers\Controller;

class CheckoutController extends Controller
{
	protected $checkoutService;

	public function __construct(CheckoutService $checkoutService)
	{
		$this->checkoutService = $checkoutService;
	}

	public function checkout($cartId, CheckoutRequest $request)
	{
		try {
			$order = $this->checkoutService->processCheckout($cartId, $request);
			return response()->json(['order' => $order], 200);
		} catch (\Exception $e) {
			return response()->json(['error' => $e->getMessage()], 500);
		}
	}
}
