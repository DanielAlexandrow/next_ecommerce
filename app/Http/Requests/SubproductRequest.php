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
			'price' => 'required|numeric|gt:0',
			'product_id' => 'required|exists:products,id',
			'available' => 'required|boolean',
			'stock' => 'required|integer|min:0',
			'sku' => [
				'required',
				'string',
				'unique:subproducts,sku'
			],
			'weight' => 'nullable|numeric|min:0',
			'dimensions' => 'nullable|array',
			'dimensions.length' => 'nullable|numeric|min:0',
			'dimensions.width' => 'nullable|numeric|min:0',
			'dimensions.height' => 'nullable|numeric|min:0',
			'metadata' => 'nullable|array'
		];
	}

	public function messages()
	{
		return [
			'price.gt' => 'Price must be greater than 0',
			'stock.min' => 'Stock cannot be negative',
			'sku.unique' => 'This SKU is already in use',
			'dimensions.*.min' => 'Dimensions must be positive numbers'
		];
	}
}
