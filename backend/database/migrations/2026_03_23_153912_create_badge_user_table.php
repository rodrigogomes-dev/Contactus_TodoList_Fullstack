<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executar migração.
     * Cria tabela de junção para relação Many-to-Many entre users e badges.
     * Um utilizador pode ter múltiplos craches, um crache pode ter múltiplos utilizadores.
     */
    public function up(): void
    {
        Schema::create('badge_user', function (Blueprint $table) {
            $table->id();                                           // ID primária
            $table->foreignId('user_id')                           // FK para users
                  ->constrained()->onDelete('cascade');             // Se utilizador deletado, remover craches
            $table->foreignId('badge_id')                          // FK para badges
                  ->constrained()->onDelete('cascade');             // Se crache deletado, remover da lista do utilizador
            $table->timestamps();                                   // created_at, updated_at (data da conquista)
        });
    }

    /**
     * Reverter migração.
     */
    public function down(): void
    {
        Schema::dropIfExists('badge_user');
    }
};
