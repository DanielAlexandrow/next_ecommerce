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
            'headers' => 'required|array',
            'headers.*.id' => 'sometimes|integer',
            'headers.*.name' => 'required|string|max:255',
            'headers.*.order_num' => 'required|integer',
            'headers.*.navigation_items' => 'required|array',
            'headers.*.navigation_items.*.id' => 'sometimes|integer',
            'headers.*.navigation_items.*.name' => 'required|string|max:255',
            'headers.*.navigation_items.*.order_num' => 'required|integer',
            'headers.*.navigation_items.*.header_id' => 'required|integer',
            'headers.*.navigation_items.*.categories' => 'required|array',
            'headers.*.navigation_items.*.categories.*.id' => 'sometimes|integer',
            'headers.*.navigation_items.*.categories.*.name' => 'required|string|max:255',
            'headers.*.navigation_items.*.categories.*.description' => 'sometimes|nullable|string',
            'headers.*.navigation_items.*.categories.*.order_num' => 'sometimes|integer',
        ];
    }
}
