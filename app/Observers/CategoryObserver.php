<?php

namespace App\Observers;

use App\Models\Category;
use App\Models\Badge;
use Illuminate\Support\Str;

class CategoryObserver
{
    /**
     * Handle the Category "created" event.
     */
    public function created(Category $category): void
    {
        // Gera seed para o icon (a partir do nome da categoria)
        $iconSeed = Str::slug($category->nome_categoria);
        
        // Cria badge principal da categoria
        Badge::create([
            'nome' => $category->nome_categoria . ' Badge',
            'descricao' => 'Ganhe esta badge completando tarefas em ' . $category->nome_categoria,
            'icon' => $iconSeed . '-badge',
            'category_id' => $category->id,
            'milestone' => null,
        ]);

        // Cria badges de milestone para a categoria
        $milestones = [
            'iniciante' => 'Iniciante em ' . $category->nome_categoria,
            'intermediário' => 'Intermediário em ' . $category->nome_categoria,
            'avançado' => 'Avançado em ' . $category->nome_categoria,
            'especialista' => 'Especialista em ' . $category->nome_categoria,
        ];

        foreach ($milestones as $milestoneType => $milestoneName) {
            Badge::create([
                'nome' => $milestoneName,
                'descricao' => 'Alcance o marco de ' . $milestoneName,
                'icon' => $iconSeed . '-' . $milestoneType,
                'category_id' => $category->id,
                'milestone' => $milestoneType,
            ]);
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
