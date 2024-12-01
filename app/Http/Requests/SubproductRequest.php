<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubproductRequest extends FormRequest
{
	public function authorize()
	{
		return true;
	}

	public function rules()
	{
		return [
			'name' => 'required|max:255|min:1',
			'price' => 'required|numeric',
			'product_id' => 'required|exists:products,id',
			'available' => 'required|boolean',
		];
	}
}
