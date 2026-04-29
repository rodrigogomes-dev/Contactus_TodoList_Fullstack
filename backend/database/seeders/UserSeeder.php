<?php

namespace Database\Seeders;

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
        // Criar users de teste com credenciais fixas (OBRIGATÓRIO)
        $admin = User::create([
            'name' => 'Test Admin',
            'email' => 'testadmin@example.com',
            'password' => bcrypt('password123'),
            'is_admin' => 1,
            'avatar_path' => 'avatar-3',
        ]);

        $user = User::create([
            'name' => 'Test User',
            'email' => 'testuser@example.com',
            'password' => bcrypt('password123'),
            'is_admin' => 0,
            'avatar_path' => 'avatar-4',
        ]);

        // Buscar dados necessários
        $categories = Category::all();
        $badges = Badge::all();

        // DAR DADOS AO TEST USER PARA TESTE IMEDIATO
        $user->badges()->attach($badges->random(3)->pluck('id'));
        for ($i = 0; $i < 5; $i++) {
            $user->tasks()->create([
                'titulo' => 'Tarefa de Teste ' . ($i + 1),
                'descricao' => 'Esta é uma tarefa gerada para o Test User.',
                'category_id' => $categories->random()->id,
                'prioridade' => 'média',
                'estado' => $i % 2 == 0 ? 'concluída' : 'pendente',
            ]);
        }

        // Criar 5 users aleatórios com Factory
        $avatarCounter = 5;
        User::factory()->count(5)->create()->each(function (User $user) use ($categories, $badges, &$avatarCounter) {
            // Atribuir um avatar pré-definido (avatar-5 até avatar-10)
            $user->update([
                'avatar_path' => 'avatar-' . $avatarCounter,
            ]);
            $avatarCounter++;

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
