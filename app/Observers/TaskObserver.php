<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\Badge;
use App\Models\Category;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        // Nenhuma ação necessária na criação
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        // Só processa quando tarefa muda para "concluída"
        if ($task->estado !== 'concluída' || !$task->isDirty('estado')) {
            return;
        }

        $user = $task->user;
        
        // Atualiza badges globais (baseadas em total de tarefas concluídas)
        $this->updateGlobalBadges($user);
        
        // Atualiza badges por categoria (baseadas em tarefas por categoria)
        $this->updateCategoryBadges($user, $task->category);
    }

    /**
     * Atualiza badges globais do utilizador.
     * Emitidas por Iniciante (1), Intermediário (10), Avançado (50), Especialista (100).
     */
    private function updateGlobalBadges(User $user): void
    {
        $completedCount = $user->tasks()
            ->where('estado', 'concluída')
            ->count();

        // Mapeamento de milestones globais por contador
        $milestoneThresholds = [
            1 => 'Iniciante',
            10 => 'Intermediário',
            50 => 'Avançado',
            100 => 'Especialista',
        ];

        foreach ($milestoneThresholds as $threshold => $badgeName) {
            if ($completedCount === $threshold) {
                // Busca badge global (category_id = null) com milestone específico
                $badge = Badge::where('nome', $badgeName)
                    ->whereNull('category_id')
                    ->first();

                if ($badge && !$user->badges()->where('badge_id', $badge->id)->exists()) {
                    $user->badges()->attach($badge->id);
                }
            }
        }
    }

    /**
     * Atualiza badges por categoria.
     * Emitida quando 10 tarefas da categoria são concluídas.
     */
    private function updateCategoryBadges(User $user, ?Category $category): void
    {
        if (!$category) {
            return; // Tarefa sem categoria - não há badge para emitir
        }

        $categoryCompletedCount = $user->tasks()
            ->where('estado', 'concluída')
            ->where('category_id', $category->id)
            ->count();

        // Especialista da categoria é emitida ao 10º completamento
        if ($categoryCompletedCount === 10) {
            // Busca a badge "Especialista em {nome}" da categoria específica
            $badge = Badge::where('category_id', $category->id)
                ->where('milestone', 'especialista')
                ->first();

            if ($badge && !$user->badges()->where('badge_id', $badge->id)->exists()) {
                $user->badges()->attach($badge->id);
            }
        }
    }

    /**
     * Handle the Task "deleted" event.
     */
    public function deleted(Task $task): void
    {
        //
    }

    /**
     * Handle the Task "restored" event.
     */
    public function restored(Task $task): void
    {
        //
    }

    /**
     * Handle the Task "force deleted" event.
     */
    public function forceDeleted(Task $task): void
    {
        //
    }
}
