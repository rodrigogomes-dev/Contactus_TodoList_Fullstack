<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\BadgeController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\StatsController;

// Gerenciar pedidos CORS preflight (OPTIONS)
// Browsers enviam OPTIONS antes de POST/PATCH para verificar permissões
// Respondemos com 204 No Content + headers CORS corretos
Route::options('/{any}', function () {
    return response()->noContent(204);
})->where('any', '.*');

// ROTAS PÚBLICAS (sem autenticação necessária)
// Limitadas com throttle: máximo 5 tentativas por minuto (previne brute force)
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login'])->middleware('throttle:5,1');
Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register'])->middleware('throttle:5,1');

// ROTAS PROTEGIDAS (requerem autenticação com token Sanctum)
// throttle:60,1 = máximo 60 requests por minuto por utilizador autenticado
Route::middleware('auth:sanctum', 'throttle:60,1')->group(function () {
    // Autenticação e perfil
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);  // Dados do utilizador atual
    Route::patch('/me', [\App\Http\Controllers\Api\AuthController::class, 'updateMe']);  // Atualizar perfil
    Route::get('/me/badges', [\App\Http\Controllers\Api\AuthController::class, 'meBadges']);  // Crachés do utilizador

    // Recursos (CRUD completo)
    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('badges', BadgeController::class);
    Route::apiResource('categories', CategoryController::class);
    
    // Carregamento de avatar
    Route::post('/users/avatar', [UserController::class, 'uploadAvatar']);
    
    // Seleção de avatar pré-definido
    Route::post('/users/avatar/select', [UserController::class, 'selectAvatar']);

    // ROTAS DE ADMINISTRADOR (requerem is_admin = true)
    Route::middleware('admin')->group(function () {
        Route::get('/admin/stats', [AdminController::class, 'stats']);
        Route::get('/stats/available-years-months', [StatsController::class, 'availableYearsAndMonths']);
        Route::get('/stats/users-growth', [StatsController::class, 'userGrowth']);
    });

});