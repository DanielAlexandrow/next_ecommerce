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
            'categories' => ['array'],
            'categories.*' => ['exists:categories,id'],
            'metadata' => ['array', 'nullable'],
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
                Rule::unique('subproducts', 'sku')->ignore(null)
            ],
            'subproducts.*.price' => ['required', 'numeric', 'min:0.01'],
            'subproducts.*.stock' => ['required', 'integer', 'min:0'],
            'subproducts.*.weight' => ['numeric', 'nullable', 'min:0'],
            'subproducts.*.dimensions' => ['array', 'nullable'],
            'subproducts.*.dimensions.length' => ['numeric', 'nullable', 'min:0'],
            'subproducts.*.dimensions.width' => ['numeric', 'nullable', 'min:0'],
            'subproducts.*.dimensions.height' => ['numeric', 'nullable', 'min:0'],
            'subproducts.*.metadata' => ['array', 'nullable'],
        ];
    }
}
