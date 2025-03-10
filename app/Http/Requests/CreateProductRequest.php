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
            'description' => ['required', 'string', 'max:65535'],
            'brand_id' => ['required', 'exists:brands,id'],
            'categories' => ['array', 'nullable'],
            'categories.*' => ['exists:categories,id'],
            'metadata' => ['json', 'nullable'],
            'metadata.featured' => ['boolean', 'nullable'],
            'metadata.tags' => ['array', 'nullable'],
            'metadata.tags.*' => ['string'],
            'metadata.seo' => ['array', 'nullable'],
            'metadata.seo.title' => ['string', 'nullable'],
            'metadata.seo.description' => ['string', 'nullable'],
            
            'subproducts' => ['required', 'array', 'min:1'],
            'subproducts.*.name' => ['required', 'string', 'max:255'],
            'subproducts.*.sku' => [
                'required', 
                'string', 
                'max:50',
                Rule::unique('subproducts', 'sku'),
                'distinct' // Ensures SKUs are unique within the request array
            ],
            'subproducts.*.price' => ['required', 'numeric', 'gt:0'], // Ensures positive price
            'subproducts.*.stock' => ['required', 'integer', 'min:0'], // Ensures non-negative stock
            'subproducts.*.weight' => ['numeric', 'nullable', 'min:0'],
            'subproducts.*.dimensions' => ['array', 'nullable'],
            'subproducts.*.dimensions.length' => ['required_with:subproducts.*.dimensions', 'numeric', 'min:0'],
            'subproducts.*.dimensions.width' => ['required_with:subproducts.*.dimensions', 'numeric', 'min:0'],
            'subproducts.*.dimensions.height' => ['required_with:subproducts.*.dimensions', 'numeric', 'min:0'],
            'subproducts.*.metadata' => ['array', 'nullable'],
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
            'subproducts.*.sku.distinct' => 'Each SKU must be unique within the product.',
            'subproducts.*.price.gt' => 'Product price must be greater than 0.',
            'subproducts.*.stock.min' => 'Product stock cannot be negative.',
            'subproducts.*.dimensions.*.required_with' => 'When dimensions are provided, all measurements (length, width, height) are required.',
            'metadata.json' => 'The metadata must be a valid JSON string.'
        ];
    }
}
