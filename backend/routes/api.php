<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\BadgeController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\StatsController;

// Handle CORS preflight requests
Route::options('/{any}', function () {
    return response()->noContent(204);
})->where('any', '.*');

//Rotas públicas
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login'])->middleware('throttle:5,1'); // Limitar a 5 tentativas por minuto 
Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register'])->middleware('throttle:5,1'); // Limitar a 5 tentativas por minuto

//Rotas Protegidas(autenticação vida token Sanctum)
Route::middleware('auth:sanctum', 'throttle:60,1')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);
    Route::patch('/me', [\App\Http\Controllers\Api\AuthController::class, 'updateMe']);
    Route::get('/me/badges', [\App\Http\Controllers\Api\AuthController::class, 'meBadges']);

    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('badges', BadgeController::class);
    Route::apiResource('categories', CategoryController::class);
    
    Route::post('/users/avatar', [UserController::class, 'uploadAvatar']);

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::get('/stats/available-years-months', [StatsController::class, 'availableYearsAndMonths']);
        Route::get('/stats/users-growth', [StatsController::class, 'userGrowth']);
    });

});