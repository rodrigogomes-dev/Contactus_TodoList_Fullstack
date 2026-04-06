<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Badge;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * NOTA: Em produção, CategoryObserver::created() dispara automaticamente
     * quando uma categoria é criada via API, gerando as 4 badges.
     * 
     * Durante seeding, criamos manualmente para garantir dados de teste.
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

        foreach ($categories as $categoryData) {
            $category = Category::create($categoryData);
            
            // Cria as 4 badges de milestone para esta categoria
            // (Em produção, CategoryObserver faz isto automaticamente)
            $this->createCategoryBadges($category);
        }
    }

    /**
     * Cria as 4 badges de milestone para uma categoria.
     * Espelha exatamente o que CategoryObserver::created() faz.
     */
    private function createCategoryBadges(Category $category): void
    {
        $iconSeed = Str::slug($category->nome);
        
        $milestones = [
            'iniciante' => 'Iniciante em ' . $category->nome,
            'intermediário' => 'Intermediário em ' . $category->nome,
            'avançado' => 'Avançado em ' . $category->nome,
            'especialista' => 'Especialista em ' . $category->nome,
        ];

        $thresholds = [
            'iniciante' => 1,
            'intermediário' => 10,
            'avançado' => 50,
            'especialista' => 100,
        ];

        foreach ($milestones as $milestoneType => $milestoneName) {
            $taskCount = $thresholds[$milestoneType];
            Badge::firstOrCreate(
                [
                    'nome' => $milestoneName,
                    'category_id' => $category->id,
                    'milestone' => $milestoneType,
                ],
                [
                    'descricao' => $taskCount . ' tarefa' . ($taskCount > 1 ? 's' : '') . ' na categoria ' . $category->nome . ' para ganhar este badge.',
                    'icon' => $iconSeed . '-' . $milestoneType,
                ]
            );
        }
    }
}
