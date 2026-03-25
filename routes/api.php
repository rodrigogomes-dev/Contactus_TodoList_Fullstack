<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\BadgeController;
use App\Http\Controllers\Api\CategoryController;

//Rotas públicas
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);

//Rotas Protegidas(autenticação vida token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/me', [\App\Http\Controllers\Api\AuthController::class, 'me']);

    Route::apiResource('tasks', TaskController::class);
    Route::apiResource('badges', BadgeController::class);
    Route::apiResource('categories', CategoryController::class);

});