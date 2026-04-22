<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executar migração (cria tabelas).
     * 
     * Cria 3 tabelas essenciais:
     *  - users: Dados de utilizadores (nome, email, password)
     *  - password_reset_tokens: Tokens para reset de password
     *  - sessions: Sessions de utilizadores
     */
    public function up(): void
    {
        // Tabela de utilizadores
        Schema::create('users', function (Blueprint $table) {
            $table->id();                           // ID primária (auto-increment)
            $table->string('name');                 // Nome completo
            $table->string('email')->unique();      // Email único (login)
            $table->string('password');             // Password hasheada com bcrypt
            $table->rememberToken();                // Token "remember me" (cookies)
            $table->timestamps();                   // created_at, updated_at (Carbon dates)
        });

        // Tabela de tokens de reset de password
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Tabela de sessions
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();  // FK para users (pode ser null)
            $table->string('ip_address', 45)->nullable();        // IPv4 ou IPv6
            $table->text('user_agent')->nullable();              // Browser/device info
            $table->longText('payload');                         // Dados da session (serializado)
            $table->integer('last_activity')->index();           // Timestamp da última ação
        });
    }

    /**
     * Reverter migração (drop tables).
     * Executado quando: php artisan migrate:rollback
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
