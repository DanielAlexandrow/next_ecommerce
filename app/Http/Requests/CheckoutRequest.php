<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest {
	public function authorize() {
		return true;
	}

	public function rules() {
		$rules = [
			'cart_id' => 'required|exists:cart,id',
		];

		if ($this->user() === null) {
			$rules = array_merge($rules, [
				'adressData.name' => 'required|string|max:255',
				'adressData.email' => 'required|email|max:255',
				'adressData.address' => 'required|string|max:255',
				'adressData.postal_code' => 'required|string|max:10',
				'adressData.city' => 'required|string|max:255',
				'adressData.country' => 'required|string|max:255',
				'adressData.phone' => 'required|string|max:20'
			]);
		}

		return $rules;
	}
}
