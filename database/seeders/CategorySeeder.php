<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['nome' => 'Informática', 'cor' => '#3B82F6'], // Azul
            ['nome' => 'RH', 'cor' => '#EC4899'], // Rosa
            ['nome' => 'Marketing', 'cor' => '#8B5CF6'], // Roxo
            ['nome' => 'Vendas', 'cor' => '#10B981'], // Verde
            ['nome' => 'Financeiro', 'cor' => '#F59E0B'], // Laranja
            ['nome' => 'Administração', 'cor' => '#6B7280'], // Cinzento
            ['nome' => 'Logística', 'cor' => '#EF4444'], // Vermelho
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
