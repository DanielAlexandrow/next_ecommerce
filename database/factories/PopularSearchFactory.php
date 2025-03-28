<?php

namespace Database\Factories;

use App\Models\PopularSearch;
use Illuminate\Database\Eloquent\Factories\Factory;

class PopularSearchFactory extends Factory
{
    protected $model = PopularSearch::class;

    public function definition()
    {
        return [
            'search_term' => $this->faker->word,
            'count' => $this->faker->numberBetween(1, 1000)
        ];
    }
}