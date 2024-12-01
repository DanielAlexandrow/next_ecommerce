<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NavigationRequest extends FormRequest
{
	public function authorize(): bool
	{
		return true;
	}

	public function rules(): array
	{
		return [
			'*.id' => 'required|integer',
			'*.name' => 'required|string',
			'*.order_num' => 'required|integer',
			'*.navigation_items' => 'sometimes|array',
			'*.navigation_items.*.id' => 'sometimes|integer',
			'*.navigation_items.*.name' => 'required|string',
			'*.navigation_items.*.description' => 'nullable|string',
			'*.navigation_items.*.order_num' => 'required|integer',
			'*.navigation_items.*.header_id' => 'required|integer',
			'*.navigation_items.*.categories.*.id' => 'sometimes|integer',
			'*.navigation_items.*.categories.*.name' => 'required|string',
		];
	}
}
