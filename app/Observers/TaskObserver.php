<?php

namespace App\Observers;

use App\Models\Task;
use App\Models\Badge;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     */
    public function created(Task $task): void
    {
        //
    }

    /**
     * Handle the Task "updated" event.
     */
    public function updated(Task $task): void
    {
        if ($task->estado === 'concluída' && $task->isDirty('estado')) {
            $user = $task->user;

            $completedCount = $user->tasks()
                ->where('estado', 'concluída')
                ->count(); 


            $milestones = [
                1 => 'Iniciante',
                10 => 'Intermediário',
                50 => 'Avançado',
                100 => 'Especialista',
            ];

            foreach($milestones as $count => $badgeName) {
                if ($completedCount === $count){
                    $badge = Badge::where('nome', $badgeName)->first();

                    if ($badge && !$user->badges()->where('badge_id', $badge->id)->exists()) {
                        $user->badges()->attach($badge->id);
                    }   

                }
            }

            $category = $task->category;
            if ($category) {
                $categoryCompletedCount = $user->tasks()
                    ->where('estado', 'concluída')
                    ->where('category_id', $category->id)
                    ->count();

                if ($categoryCompletedCount === 10) {
                    $categoryBadgeName = "Especialista em {$category->nome_categoria}";
                    $badge = Badge::where('nome', $categoryBadgeName)->first();

                    if ($badge && !$user->badges()->where('badge_id', $badge->id)->exists()) {
                        $user->badges()->attach($badge->id);
                    }
                }
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
