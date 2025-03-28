<?php

namespace Database\Factories;

use App\Models\Deal;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class DealFactory extends Factory {
    protected $model = Deal::class;

    public function definition() {
        return [
            'name' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'discount_amount' => $this->faker->randomFloat(2, 5, 50),
            'discount_type' => $this->faker->randomElement(['percentage', 'fixed']),
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => $this->faker->randomElement(['product', 'category', 'brand', 'cart']),
            'conditions' => null,
            'metadata' => null
        ];
    }

    public function inactive() {
        return $this->state(function (array $attributes) {
            return [
                'active' => false
            ];
        });
    }

    public function expired() {
        return $this->state(function (array $attributes) {
            return [
                'start_date' => Carbon::now()->subDays(14),
                'end_date' => Carbon::now()->subDays(7)
            ];
        });
    }

    public function withMinimumAmount($amount) {
        return $this->state(function (array $attributes) use ($amount) {
            return [
                'conditions' => [
                    'minimum_amount' => $amount
                ]
            ];
        });
    }
}