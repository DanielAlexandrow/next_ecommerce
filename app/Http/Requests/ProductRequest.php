<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'brand_id' => 'required|exists:brands,id',
            'available' => 'required|boolean',
            'subproducts' => 'required|array|min:1',
            'subproducts.*.name' => 'required|string|max:255',
            'subproducts.*.price' => 'required|numeric|gt:0',
            'subproducts.*.available' => 'boolean',
            'subproducts.*.stock' => 'required|integer|min:0'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Product name is required.',
            'description.required' => 'Product description is required.',
            'brand_id.exists' => 'The selected brand does not exist.',
            'subproducts.*.price.gt' => 'Price must be greater than 0.',
            'subproducts.*.stock.min' => 'Stock cannot be negative.'
        ];
    }
}
