<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'titulo' => fake()->sentence(),
            'descricao' => fake()->paragraph(),
            'estado' => fake()->randomElement(['pendente', 'concluída']),
            'prioridade' => fake()->randomElement(['baixa', 'média', 'alta']),
            'data_vencimento' => fake()->dateTime(),
            'user_id' => User::factory(),
            'category_id' => Category::factory(),
        ];
    }
}
