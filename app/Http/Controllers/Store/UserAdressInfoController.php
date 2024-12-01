<?php

namespace App\Http\Controllers\Store;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UserAdressInfoController extends Controller
{
	public function index()
	{
		$user = auth()->user();
		$address = $user->addressInfo;
		return inertia("store/profile/UserAdressInfo", ['address' => $address]);
	}

	public function store(Request $request)
	{
		// Validate the request data
		$request->validate([
			'name' => 'required|string|max:255',
			'postcode' => 'required|string|max:20',
			'city' => 'required|string|max:255',
			'country' => 'required|string|max:255',
			'email' => 'required|email|max:255',
			'street' => 'required|string|max:255',
		]);

		// Get the authenticated user
		$user = auth()->user();

		// Check if the user already has an address
		$addressInfo = $user->addressInfo;

		if ($addressInfo) {
			$addressInfo->update($request->only(['name', 'postcode', 'city', 'country', 'street', 'email']));
		} else {
			$addressInfo = new \App\Models\AddressInfo($request->only(['name', 'postcode', 'city', 'country', 'street', 'email']));
			$addressInfo->save();

			$user->id_address_info = $addressInfo->id;
			$user->save();
		}

		return response()->json([])->header('X-Message', 'Address updated successfully');
	}
}
