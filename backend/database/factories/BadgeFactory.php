<?php

namespace Database\Factories;

use App\Models\Badge;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Badge>
 */
class BadgeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => fake()->word(),
            'descricao' => fake()->paragraph(),
            'icon' => fake()->word(),
            'category_id' => Category::factory(),
            'milestone' => fake()->randomElement(['iniciante', 'intermediário', 'avançado', 'especialista']),
        ];
    }
}
