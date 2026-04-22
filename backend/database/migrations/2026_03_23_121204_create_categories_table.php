<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Executar migração.
     * Cria tabela de categorias para organizar tarefas por tipo.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();                   // ID primária
            $table->string('nome');         // Nome da categoria (ex: "Casa", "Trabalho")
            $table->string('cor');          // Cor hex para UI (ex: "#FF5733")
            $table->timestamps();           // created_at, updated_at
        });
    }

    /**
     * Reverter migração.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
