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
            'description' => 'nullable|string',
            'brand_id' => 'nullable|exists:brands,id',
            'available' => 'boolean',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'images' => 'nullable|array',
            'images.*' => 'exists:images,id',
            'metadata' => 'nullable|array',
            'metadata.featured' => 'nullable|boolean',
            'metadata.tags' => 'nullable|array',
            'metadata.tags.*' => 'string',
            'metadata.seo' => 'nullable|array',
            'metadata.seo.title' => 'nullable|string',
            'metadata.seo.description' => 'nullable|string',
            'subproducts' => 'array|required',
            'subproducts.*.name' => 'required|string|max:255',
            'subproducts.*.price' => 'required|numeric|gt:0',
            'subproducts.*.sku' => [
                'required',
                'string',
                'distinct',
                'unique:subproducts,sku'
            ],
            'subproducts.*.stock' => 'required|integer|min:0',
            'subproducts.*.weight' => 'nullable|numeric|min:0',
            'subproducts.*.dimensions' => 'nullable|array',
            'subproducts.*.dimensions.length' => 'nullable|numeric|min:0',
            'subproducts.*.dimensions.width' => 'nullable|numeric|min:0',
            'subproducts.*.dimensions.height' => 'nullable|numeric|min:0',
            'subproducts.*.metadata' => 'nullable|array',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'brand_id.required' => 'Please select a brand for this product.',
            'brand_id.exists' => 'The selected brand does not exist.',
            'subproducts.*.sku.distinct' => 'Each subproduct must have a unique SKU.',
            'subproducts.*.sku.unique' => 'This SKU is already in use by another product.',
            'subproducts.*.price.gt' => 'Price must be greater than 0.',
            'subproducts.*.stock.min' => 'Stock cannot be negative.',
            'subproducts.*.dimensions.*.min' => 'Dimensions must be positive numbers.',
            'metadata.tags.*.string' => 'All tags must be text values.',
        ];
    }
}
