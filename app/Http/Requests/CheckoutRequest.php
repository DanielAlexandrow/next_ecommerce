<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest {
    public function authorize() {
        return true;
    }

    public function rules() {
        $rules = [
            'cart_id' => 'required|exists:carts,id',
            'adressData' => 'required_if:guest,true|array'
        ];

        if (!$this->user()) {
            $rules['adressData.name'] = 'required|string|max:255';
            $rules['adressData.email'] = 'required|email|max:255';
            $rules['adressData.address'] = 'required|string|max:255';
            $rules['adressData.postal_code'] = 'required|string|max:10';
            $rules['adressData.city'] = 'required|string|max:255';
            $rules['adressData.country'] = 'required|string|max:255';
            $rules['adressData.phone'] = 'required|string|max:20';
        }

        return $rules;
    }

    public function messages() {
        return [
            'adressData.required_if' => 'Address information is required for guest checkout.',
            'adressData.array' => 'Address information must be provided in the correct format.'
        ];
    }
}
