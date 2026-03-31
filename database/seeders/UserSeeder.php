<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Badge;
use Illuminate\Support\Facades\DB; 

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buscar dados necessários
        $categories = Category::all();
        $badges = Badge::all();

        // Criar 5 users com Factory
        User::factory()->count(5)->create()->each(function (User $user) use ($categories, $badges) {
            
            // Criar 3-5 tasks por user
            for ($i = 0; $i < random_int(3, 5); $i++) {
                $user->tasks()->create([
                    'titulo' => fake()->sentence(),
                    'descricao' => fake()->paragraph(),
                    'category_id' => $categories->random()->id,
                    'prioridade' => fake()->randomElement(['baixa', 'média', 'alta']),
                    'estado' => fake()->randomElement(['pendente', 'concluída']),
                ]);
            }

            // Attach 2-3 badges aleatórios
            $user->badges()->attach(
                $badges->random(random_int(2, 3))->pluck('id')->toArray()
            );
        });
    }
}
