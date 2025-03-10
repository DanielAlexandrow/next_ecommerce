<?php

namespace Database\Factories;

use App\Models\Guest;
use App\Models\AddressInfo;
use Illuminate\Database\Eloquent\Factories\Factory;

class GuestFactory extends Factory {
    protected $model = Guest::class;

    public function definition() {
        $addressInfo = AddressInfo::factory()->create();
        
        return [
            'email' => $this->faker->unique()->safeEmail,
            'phone' => $this->faker->phoneNumber,
            'id_address_info' => $addressInfo->id
        ];
    }
}
