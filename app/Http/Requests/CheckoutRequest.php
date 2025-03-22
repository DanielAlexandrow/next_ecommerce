<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CheckoutRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'cart_id' => 'required|exists:carts,id'
        ];

        // Only require address data for guest checkout
        if (!Auth::check()) {
            $rules['adressData.name'] = 'required|string|max:255';
            $rules['adressData.email'] = 'required|email|max:255';
            $rules['adressData.phone'] = 'required|string|max:20';
            $rules['adressData.address'] = 'required|string|max:255';
            $rules['adressData.postal_code'] = 'required|string|max:20';
            $rules['adressData.city'] = 'required|string|max:255';
            $rules['adressData.country'] = 'required|string|max:255';
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'adressData.email.required' => 'The email address is required',
            'adressData.phone.required' => 'The phone number is required',
            'adressData.address.required' => 'The shipping address is required',
            'adressData.postal_code.required' => 'The postal code is required',
            'adressData.city.required' => 'The city is required',
            'adressData.country.required' => 'The country is required'
        ];
    }
}
