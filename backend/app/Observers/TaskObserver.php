<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\Badge;
use App\Models\Category;
use App\Models\User;

class TaskObserver
{
    /**
     * Evento disparado quando uma tarefa é CRIADA.
     * Não executa nenhuma ação especial na criação.
     * (Pronto para lógica futura se necessário)
     *
     * @param Task $task Tarefa recentemente criada
     */
    public function created(Task $task): void
    {
        // Sem ação necessária na criação
    }

    /**
     * Evento disparado quando uma tarefa é ATUALIZADA.
     * Processa emissão de badges quando tarefa muda para "concluída".
     *
     * Fluxo:
     *  1. Verifica se estado mudou para 'concluída'
     *  2. Calcula badges globais do utilizador (Iniciante, Intermediário, etc)
     *  3. Calcula badges por categoria específica
     *  4. Atribui badges ao utilizador se atingir milestone
     *
     * @param Task $task Tarefa que foi atualizada
     */
    public function updated(Task $task): void
    {
        // Só processa quando tarefa muda para "concluída"
        if ($task->estado !== 'concluída' || !$task->isDirty('estado')) {
            return;
        }

        $user = $task->user;
        
        // Atualiza badges GLOBAIS (baseadas em TOTAL de tarefas concluídas do utilizador)
        $this->updateGlobalBadges($user);
        
        // Atualiza badges POR CATEGORIA (baseadas em tarefas concluídas nessa categoria)
        $this->updateCategoryBadges($user, $task->category);
    }

    /**
     * Atualiza badges globais do utilizador.
     * Emitidas quando utilizador conclui 1, 10, 50 ou 100 tarefas no total.
     *
     * Milestones globais:
     *  - Iniciante: 1 tarefa concluída
     *  - Intermediário: 10 tarefas concluídas
     *  - Avançado: 50 tarefas concluídas
     *  - Especialista: 100 tarefas concluídas
     *
     * @param User $user Utilizador a verificar/atualizar
     */
    private function updateGlobalBadges(User $user): void
    {
        // Conta total de tarefas CONCLUÍDAS deste utilizador
        $completedCount = $user->tasks()
            ->where('estado', 'concluída')
            ->count();

        // Mapeamento de milestones globais: contador → nome do badge
        $milestoneThresholds = [
            1   => 'Iniciante',
            10  => 'Intermediário',
            50  => 'Avançado',
            100 => 'Especialista',
        ];

        foreach ($milestoneThresholds as $threshold => $badgeName) {
            // Se contador atingiu exatamente este milestone
            if ($completedCount === $threshold) {
                // Procura badge GLOBAL (sem categoria associada)
                $badge = Badge::where('nome', $badgeName)
                    ->whereNull('category_id')
                    ->first();

                // Se badge existe E utilizador ainda não a tem, atribui
                if ($badge && !$user->badges()->where('badge_id', $badge->id)->exists()) {
                    $user->badges()->attach($badge->id);
                }
            }
        }
    }

    /**
     * Atualiza badges por categoria específica.
     * Emitidas quando utilizador atinge 1, 10, 50 ou 100 tarefas concluídas NESSA CATEGORIA.
     *
     * @param User $user Utilizador a verificar
     * @param Category|null $category Categoria da tarefa concluída (null = sem categoria)
     */
    private function updateCategoryBadges(User $user, ?Category $category): void
    {
        // Se tarefa não tem categoria, não há badge de categoria para emitir
        if (!$category) {
            return;
        }

        // Conta tarefas CONCLUÍDAS nesta CATEGORIA específica
        $categoryCompletedCount = $user->tasks()
            ->where('estado', 'concluída')
            ->where('category_id', $category->id)
            ->count();

        // Mapeamento de milestones por categoria: contador → tipo de milestone
        $milestoneThresholds = [
            1   => 'iniciante',
            10  => 'intermediário',
            50  => 'avançado',
            100 => 'especialista',
        ];

        foreach ($milestoneThresholds as $threshold => $milestoneType) {
            // Se contador atingiu exatamente este milestone nesta categoria
            if ($categoryCompletedCount === $threshold) {
                // Procura badge desta CATEGORIA com este MILESTONE
                $badge = Badge::where('category_id', $category->id)
                    ->where('milestone', $milestoneType)
                    ->first();

                // Se badge existe E utilizador ainda não a tem, atribui
                if ($badge && !$user->badges()->where('badge_id', $badge->id)->exists()) {
                    $user->badges()->attach($badge->id);
                }
            }
        }
    }

    /**
     * Evento disparado quando uma tarefa é DELETADA.
     * (Sem ação especial por enquanto)
     *
     * @param Task $task Tarefa que foi deletada
     */
    public function deleted(Task $task): void
    {
        // Regressas futuras: ex: revogar badges se necessário
    }

    /**
     * Evento disparado quando uma tarefa é RESTAURADA (soft delete).
     *
     * @param Task $task Tarefa que foi restaurada
     */
    public function restored(Task $task): void
    {
        // Regressas futuras
    }

    /**
     * Evento disparado quando uma tarefa é DELETADA PERMANENTEMENTE.
     *
     * @param Task $task Tarefa que foi deletada permanentemente
     */
    public function forceDeleted(Task $task): void
    {
        // Regressas futuras
    }
}
