<?php

namespace App\Observers;

use App\Models\Category;
use App\Models\Badge;
use Illuminate\Support\Str;

class CategoryObserver
{
    /**
     * Evento disparado quando uma categoria é CRIADA.
     * Cria automaticamente badges de milestone para essa categoria.
     *
     * Fluxo:
     *  1. Gera slug da categoria para fallback de ícone
     *  2. Define 4 milestones: iniciante, intermediário, avançado, especialista
     *  3. Para cada milestone, cria badge com firstOrCreate (evita duplicação)
     *  4. Cada badge tem descrição com threshold de tarefas
     *
     * Nota: O campo 'icon' é fallback visual - o match() no modelo Badge prevalece.
     *
     * @param Category $category Categoria recentemente criada
     */
    public function created(Category $category): void
    {
        // Gera slug a partir do nome da categoria (ex: "Design" → "design")
        // Usado como fallback para nome de ícone
        $iconSeed = Str::slug($category->nome);
        
        // Define milestones válidos (deve ser EXATO com Badge model)
        $milestones = [
            'iniciante'      => 'Iniciante em ' . $category->nome,
            'intermediário'  => 'Intermediário em ' . $category->nome,
            'avançado'       => 'Avançado em ' . $category->nome,
            'especialista'   => 'Especialista em ' . $category->nome,
        ];

        // Mapeamento de milestone para threshold de tarefas concluídas
        $thresholds = [
            'iniciante'      => 1,
            'intermediário'  => 10,
            'avançado'       => 50,
            'especialista'   => 100,
        ];

        // Para cada milestone, cria badge de forma segura (sem duplicação)
        foreach ($milestones as $milestoneType => $milestoneName) {
            $taskCount = $thresholds[$milestoneType];
            
            // firstOrCreate: cria se não existir, atualiza se existir
            // (protege contra observer rodar múltiplas vezes)
            Badge::firstOrCreate(
                [
                    'nome'         => $milestoneName,
                    'category_id'  => $category->id,
                    'milestone'    => $milestoneType,
                ],
                [
                    'descricao' => $taskCount . ' tarefa' . ($taskCount > 1 ? 's' : '') 
                                . ' na categoria ' . $category->nome 
                                . ' para ganhar este badge.',
                    'icon' => $iconSeed . '-' . $milestoneType,  // Fallback visual
                ]
            );
        }
    }

    /**
     * Evento disparado quando uma categoria é ATUALIZADA.
     * (Sem ação especial por enquanto)
     *
     * @param Category $category Categoria que foi atualizada
     */
    public function updated(Category $category): void
    {
        // Regressas futuras: ex: sincronizar badges se nome mudar
    }

    /**
     * Evento disparado quando uma categoria é DELETADA.
     * Remove todas as badges associadas a esta categoria.
     *
     * Comportamento:
     *  - Badges da categoria são deletadas
     *  - Tarefas da categoria: category_id fica null (orfãs)
     *  - Utilizadores que têm essas badges: managem as badges (sem remoção automática)
     *
     * @param Category $category Categoria que foi deletada
     */
    public function deleted(Category $category): void
    {
        // Deleta todas as badges desta categoria
        Badge::where('category_id', $category->id)->delete();
    }

    /**
     * Evento disparado quando uma categoria é RESTAURADA (soft delete).
     *
     * @param Category $category Categoria que foi restaurada
     */
    public function restored(Category $category): void
    {
        // Regressas futuras
    }

    /**
     * Evento disparado quando uma categoria é DELETADA PERMANENTEMENTE.
     *
     * @param Category $category Categoria que foi deletada permanentemente
     */
    public function forceDeleted(Category $category): void
    {
        // Regressas futuras
    }
}
