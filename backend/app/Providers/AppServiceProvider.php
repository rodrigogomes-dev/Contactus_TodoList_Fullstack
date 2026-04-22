<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Task;
use App\Models\Category;
use App\Observers\TaskObserver;
use App\Observers\CategoryObserver;
use App\Policies\TaskPolicy;
use App\Policies\CategoryPolicy;
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Regista qualquer serviço da aplicação.
     * Este é o local para registar bindings no container de serviços.
     * Ex: $this->app->singleton(MyService::class, MyServiceImplementation::class);
     */
    public function register(): void
    {
        // Registos vazios por enquanto
        // Futuros: serviços, singletons, factories
    }

    /**
     * Bootstrap qualquer serviço da aplicação.
     * Executado DEPOIS de todos os providers serem registados.
     * É o local para:
     *  - Registar Gates e Policies (autorização)
     *  - Registar Model Observers (eventos do modelo)
     *  - Configurar listeners
     */
    public function boot(): void
    {
        // Registar Policies (autorização para modelos)
        // Gate::policy() liga um modelo a uma Policy
        Gate::policy(Task::class, TaskPolicy::class);           // Tarefas: utilizador pode create/update/delete?
        Gate::policy(Category::class, CategoryPolicy::class);   // Categorias: admin pode create/update/delete?
        
        // Registar Observers (listeners de eventos do modelo)
        // Observer escuta eventos: created, updated, deleted, etc
        Task::observe(TaskObserver::class);           // Dispara badges quando tarefa é concluída
        Category::observe(CategoryObserver::class);   // Cria badges quando categoria é criada
    }
}
