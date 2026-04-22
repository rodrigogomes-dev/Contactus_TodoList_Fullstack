<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executar migração.
     * Cria tabela de crachés (badges) para gamificação.
     */
    public function up(): void
    {
        Schema::create('badges', function (Blueprint $table) {
            $table->id();                           // ID primária
            $table->string('nome');                 // Nome do craché (ex: "Primeira Tarefa")
            $table->string('descricao')->nullable(); // Descrição (ex: "Complete a sua primeira tarefa")
            $table->timestamps();                   // created_at, updated_at
        });
    }

    /**
     * Reverter migração.
     */
    public function down(): void
    {
        Schema::dropIfExists('badges');
    }
};
