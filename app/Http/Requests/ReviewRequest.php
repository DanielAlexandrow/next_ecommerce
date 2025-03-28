<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:100',
            'content' => 'nullable|string|max:1000',
            'rating' => 'required|integer|min:1|max:5',
        ];

        // Only add unique validation for new reviews
        if ($this->route('product')) {
            $productId = $this->route('product')->id;
            $rules['user_id'] = 'unique:reviews,user_id,NULL,id,product_id,' . $productId;
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'user_id.unique' => 'You have already reviewed this product.'
        ];
    }
}
