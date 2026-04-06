<?php

namespace App\Observers;

use App\Models\Category;
use App\Models\Badge;
use Illuminate\Support\Str;

class CategoryObserver
{
    /**
     * Handle the Category "created" event.
     * 
     * Cria badges de milestone para a categoria de forma segura (sem duplicação).
     * O campo 'icon' é usável como fallback mas não é crítico - o match() do Badge model prevalece.
     */
    public function created(Category $category): void
    {
        // Normaliza o slug da categoria para uso em fallback de ícone
        $iconSeed = Str::slug($category->nome);
        
        // Define milestones válidos (deve ser exato com Badge model)
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

        // Usa firstOrCreate para evitar duplicação se este observer rodar múltiplas vezes
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
                    'icon' => $iconSeed . '-' . $milestoneType, // Fallback visual
                ]
            );
        }
    }

    /**
     * Handle the Category "updated" event.
     */
    public function updated(Category $category): void
    {
        //
    }

    /**
     * Handle the Category "deleted" event.
     */
    public function deleted(Category $category): void
    {
        // Deleta badge associada quando categoria é deletada
        Badge::where('category_id', $category->id)->delete();
    }

    /**
     * Handle the Category "restored" event.
     */
    public function restored(Category $category): void
    {
        //
    }

    /**
     * Handle the Category "force deleted" event.
     */
    public function forceDeleted(Category $category): void
    {
        //
    }
}
