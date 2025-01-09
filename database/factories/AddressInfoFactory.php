<?php

namespace Database\Factories;

use App\Models\AddressInfo;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressInfoFactory extends Factory {
    protected $model = AddressInfo::class;

    public function definition() {
        return [
            'name' => $this->faker->name(),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'postal_code' => $this->faker->postcode(),
            'country' => $this->faker->country(),
            'phone' => $this->faker->phoneNumber()
        ];
    }
}
