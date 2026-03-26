<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Badge;
use App\Models\Category;
use Illuminate\Support\Str;

class BadgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $badges = [
            ['nome' => 'Iniciante', 'descricao' => 'Conclua sua primeira tarefa para ganhar esta badge.', 'icon' => 'badge-iniciante', 'milestone' => 'iniciante'],
            ['nome' => 'Intermediário', 'descricao' => 'Conclua 10 tarefas para ganhar esta badge.', 'icon' => 'badge-intermediario', 'milestone' => 'intermediário'],
            ['nome' => 'Avançado', 'descricao' => 'Conclua 50 tarefas para ganhar esta badge.', 'icon' => 'badge-avancado', 'milestone' => 'avançado'],
            ['nome' => 'Especialista','descricao' => 'Conclua 100 tarefas para ganhar esta badge.', 'icon' => 'badge-especialista', 'milestone' => 'especialista'],
        ];

        foreach ($badges as $badge) {
            Badge::create(array_merge($badge, ['category_id' => null]));
        }

        foreach (Category::all() as $category) {
            Badge::create([
                'nome' => "Especialista em {$category->nome_categoria}",
                'descricao' => "Conclua 10 tarefas na categoria {$category->nome_categoria} para ganhar esta badge.",
                'category_id' => $category->id,
                'icon' => Str::slug("badge-{$category->nome_categoria}"),
                'milestone' => null,
            ]);
        }
    }
}
