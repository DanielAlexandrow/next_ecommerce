<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory {
    protected $model = Category::class;

    public function definition(): array {
        $name = $this->faker->words(2, true);
        return [
            'name' => $name,
            'description' => $this->faker->paragraph(),
            'slug' => Str::slug($name),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the category is a child category.
     */
    public function child(): Factory {
        return $this->state(function (array $attributes) {
            return [
                'parent_id' => Category::factory(),
            ];
        });
    }

    /**
     * Create a category with a specific parent.
     */
    public function withParent(Category $parent): Factory {
        return $this->state(function (array $attributes) use ($parent) {
            return [
                'parent_id' => $parent->id,
            ];
        });
    }
}
