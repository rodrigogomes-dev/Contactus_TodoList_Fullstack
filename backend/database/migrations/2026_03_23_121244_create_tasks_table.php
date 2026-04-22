<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Executar migração.
     * Cria tabela de tarefas com relações para utilizadores e categorias.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();                                               // ID primária
            $table->foreignId('user_id')                               // FK para users (proprietário)
                  ->constrained()->onDelete('cascade');                 // Se utilizador deletado, tarefa apaga
            $table->string('titulo');                                   // Título da tarefa
            $table->text('descricao')->nullable();                      // Descrição opcional
            $table->enum('estado', ['pendente', 'concluída'])          // Estado: pendente ou concluída
                  ->default('pendente');
            $table->enum('prioridade', ['baixa', 'média', 'alta'])     // Nível de prioridade
                  ->default('média');
            $table->date('data_vencimento')->nullable();                // Data limite (pode ser NULL)
            $table->foreignId('category_id')                            // FK para categories (opcional)
                  ->nullable()
                  ->constrained('categories')
                  ->onDelete('set null');                               // Se categoria deletada, deixar NULL
            $table->timestamps();                                       // created_at, updated_at
        });
    }

    /**
     * Reverter migração.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
