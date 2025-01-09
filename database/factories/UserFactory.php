<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\AddressInfo;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserFactory extends Factory {
    protected $model = User::class;

    public function definition() {
        return [
            'name' => $this->faker->name,
            'email' => $this->faker->unique()->safeEmail,
            'email_verified_at' => now(),
            'password' => bcrypt('password123'),
            'remember_token' => Str::random(10),
            'role' => 'driver',
            'id_address_info' => AddressInfo::factory()
        ];
    }

    public function admin() {
        return $this->state(function (array $attributes) {
            return [
                'role' => 'admin'
            ];
        });
    }

    public function unverified() {
        return $this->state(function (array $attributes) {
            return [
                'email_verified_at' => null
            ];
        });
    }
}
