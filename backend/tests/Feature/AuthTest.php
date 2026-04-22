<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    /**
     * Teste: registar um novo utilizador com dados válidos.
     * 
     * Verifica:
     *  - HTTP 201 (Criado) retornado
     *  - Resposta contém estrutura correta (user + token)
     *  - Utilizador foi realmente criado na BD
     */
    public function test_can_register_new_user(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'is_admin', 'created_at'],
                'token'
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com'
        ]);
    }

    /**
     * Teste: fazer login com credenciais válidas.
     * 
     * Verifica:
     *  - HTTP 200 se credenciais estão corretas
     *  - Token de autenticação é devolvido
     *  - Dados do utilizador coincidem com o request
     */
    public function test_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'is_admin'],
                'token'
            ])
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                ]
            ]);
    }

    /**
     * Teste: falha de login com password incorreta.
     * 
     * Verifica:
     *  - HTTP 401 (Não Autorizado)
     *  - Mensagem genérica de erro
     */
    public function test_cannot_login_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Credenciais inválidas'
            ]);
    }

    /**
     * Teste: falha de login com email inexistente.
     * 
     * Verifica:
     *  - HTTP 401
     *  - Mensagem genérica (não revela se email existe)
     */
    public function test_cannot_login_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Credenciais inválidas'
            ]);
    }

    /**
     * Test registration requires valid email
     */
    public function test_registration_requires_valid_email(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'invalid-email',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test authenticated user can logout
     */
    public function test_can_logout_authenticated_user(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logout bem-sucedido'
            ]);

        // Verify token is deleted
        $this->assertEquals(0, $user->tokens()->count());
    }

    /**
     * Test get current user info (me endpoint)
     */
    public function test_can_get_me_endpoint(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'is_admin', 'created_at']
            ])
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                ]
            ]);
    }

    /**
     * Test cannot access protected routes without token
     */
    public function test_cannot_access_protected_routes_without_token(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }
}
