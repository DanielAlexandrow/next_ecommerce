<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization will be handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'brand_id' => ['required', 'exists:brands,id'],
            'available' => ['required', 'boolean'],
            'subproducts' => ['required', 'array', 'min:1'],
            'subproducts.*.name' => ['required', 'string', 'max:255'],
            'subproducts.*.price' => ['required', 'numeric', 'gt:0'],
            'subproducts.*.available' => ['boolean'],
            'subproducts.*.stock' => ['required', 'integer', 'min:0']
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages(): array
    {
        return [
            'subproducts.*.price.gt' => 'Product price must be greater than 0.',
            'subproducts.required' => 'At least one variant is required.',
            'subproducts.*.stock.min' => 'Stock cannot be negative.'
        ];
    }
}
