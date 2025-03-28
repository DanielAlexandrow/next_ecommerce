<?php

namespace Database\Factories;

use App\Models\SearchHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SearchHistoryFactory extends Factory
{
    protected $model = SearchHistory::class;

    public function definition()
    {
        return [
            'user_id' => User::factory(),
            'search_term' => $this->faker->word,
            'searched_at' => now()
        ];
    }
}