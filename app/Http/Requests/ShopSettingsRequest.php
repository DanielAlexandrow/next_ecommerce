<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ShopSettingsRequest extends FormRequest {
    public function authorize() {
        return true; // Adjust based on your authorization logic
    }

    public function rules() {
        return [
            'currency' => 'required|string|size:3',
            'mapbox_api_key' => 'nullable|string',
            'sendgrid_api_key' => 'nullable|string',
            'shop_name' => 'required|string|max:255',
            'shop_logo' => 'nullable|string',
        ];
    }
}
