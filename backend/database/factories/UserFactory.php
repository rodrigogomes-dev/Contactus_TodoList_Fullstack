<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * Password armazenada em cache durante testes.
     * Evita rehashing de password múltiplas vezes (performance).
     *
     * @var ?string
     */
    protected static ?string $password;

    /**
     * Define o estado padrão do modelo.
     * Gera dados fictícios com Faker para testes.
     *
     * @return array<string, mixed> Atributos do utilizador
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),                           // Nome aleatório fictício
            'email' => fake()->unique()->safeEmail(),           // Email único e seguro
            'password' => static::$password ??= Hash::make('password'),  // Password hasheada (reutilizada)
            'remember_token' => Str::random(10),                // Token aleatório para "remember me"
            'is_admin' => false,                                // Não é admin por padrão
        ];
    }

    /**
     * Criar utilizador com email não verificado.
     * Útil para testes de verificação de email.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
