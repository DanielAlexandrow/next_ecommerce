<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest {
	public function authorize(): bool {
		return true;
	}

	public function rules(): array {
		$categoryId = $this->route('id');

		return [
			'name' => [
				'required',
				'string',
				'max:50',
				'min:2',
				Rule::unique('categories', 'name')->ignore($categoryId)
			],
			'description' => 'nullable|string|max:255',
			'parent_id' => [
				'nullable',
				'integer',
				'exists:categories,id',
				function ($attribute, $value, $fail) use ($categoryId) {
					if ($value == $categoryId) {
						$fail('A category cannot be its own parent.');
					}
				}
			]
		];
	}

	public function messages(): array {
		return [
			'name.required' => 'Category name is required.',
			'name.max' => 'Category name cannot be longer than 50 characters.',
			'name.min' => 'Category name must be at least 2 characters.',
			'name.unique' => 'This category name already exists.',
			'description.max' => 'Description cannot be longer than 255 characters.',
			'parent_id.exists' => 'Selected parent category does not exist.',
		];
	}
}
