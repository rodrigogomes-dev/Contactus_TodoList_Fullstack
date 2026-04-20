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
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Task::class, TaskPolicy::class);
        Gate::policy(Category::class, CategoryPolicy::class);
        Task::observe(TaskObserver::class);
        Category::observe(CategoryObserver::class);
    }
}
