<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
	public function authorize(): bool
	{
		return true;
	}

	public function rules(): array
	{
		return [
			'name' => 'required|max:60|min:1',
			'available' => 'required|boolean',
			'description' => 'required|max:500|min:1',
			'brand_id' => '',
		];
	}
}
