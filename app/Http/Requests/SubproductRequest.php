<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubproductRequest extends FormRequest
{
	public function authorize()
	{
		return true;
	}

	public function rules(): array
	{
		return [
			'name' => 'required|string|max:255',
			'price' => 'required|numeric|gt:0',
			'available' => 'boolean',
			'stock' => 'required|integer|min:0',
			'dimensions' => 'array|nullable',
			'dimensions.*' => 'numeric|min:0',
			'weight' => 'numeric|nullable|min:0',
			'metadata' => 'json|nullable'
		];
	}

	public function messages(): array
	{
		return [
			'name.required' => 'Variant name is required',
			'price.required' => 'Price is required',
			'price.gt' => 'Price must be greater than 0',
			'stock.min' => 'Stock cannot be negative',
			'dimensions.*.min' => 'Dimensions must be positive numbers'
		];
	}
}
