<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Http\Requests\Auth\LoginUserRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\BadgeResource;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    /**
     * Regista um novo utilizador na plataforma.
     * Valida dados de entrada, cria utilizador, e retorna token de acesso.
     *
     * Fluxo:
     *  1. Valida email e password com RegisterUserRequest
     *  2. Cria novo utilizador (password automaticamente hashed)
     *  3. Gera token Sanctum para autenticação de API
     *  4. Retorna utilizador + token com status 201 (Criado)
     *
     * @param RegisterUserRequest $request Dados validados de registo
     * @return \Illuminate\Http\JsonResponse Utilizador + token, HTTP 201
     */
    public function register(RegisterUserRequest $request)
    {
        $user = User::create([
            'email'    => $request->validated()['email'],
            'password' => Hash::make($request->validated()['password']),
            'name'     => $request->validated()['email'],  // Inicialmente, name = email
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Autentica um utilizador existente.
     * Valida credenciais e retorna token se bem-sucedido.
     *
     * Segurança:
     *  - Verifica se utilizador existe via email
     *  - Valida password com bcrypt hash check
     *  - Retorna mensagem genérica em caso de falha (não revela se email existe)
     *  - Gera novo token Sanctum por sessão
     *
     * @param LoginUserRequest $request Email + password
     * @return \Illuminate\Http\JsonResponse Utilizador + token, HTTP 200 ou 401
     */
    public function login(LoginUserRequest $request)
    {
        $user = User::where('email', $request->validated()['email'])->first();

        // Valida se utilizador existe E password é correto
        if (!$user || !Hash::check($request->validated()['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenciais inválidas',
            ], 401);
        }

        // Gera token de sessão
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 200);
    }

    /**
     * Termina a sessão do utilizador autenticado.
     * Remove o token de acesso atual da base de dados.
     *
     * Efeito:
     *  - Token usado no pedido é revogado
     *  - Utilizador não pode usar este token para novos pedidos
     *  - Outros tokens do utilizador permanecem válidos (múltiplos dispositivos)
     *
     * @param Request $request Pedido com utilizador autenticado
     * @return \Illuminate\Http\JsonResponse Mensagem de sucesso, HTTP 200
     */
    public function logout(Request $request)
    {
        // Remove token atual da base de dados
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Logout bem-sucedido',
        ], 200);
    }

    /**
     * Retorna dados do utilizador autenticado.
     * Inclui relações carregadas: tarefas e crachés.
     *
     * @param Request $request Pedido com utilizador autenticado
     * @return \Illuminate\Http\JsonResponse Dados completos do utilizador, HTTP 200
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('tasks', 'badges')),
        ], 200);
    }

    /**
     * Atualiza perfil do utilizador autenticado.
     * Pode alterar: nome, avatar_path, etc.
     *
     * Validação: UpdateProfileRequest garante dados válidos
     *
     * @param UpdateProfileRequest $request Dados validados a atualizar
     * @return \Illuminate\Http\JsonResponse Utilizador atualizado, HTTP 200
     */
    public function updateMe(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'user' => new UserResource($user->fresh()),  // fresh() recarrega dados
        ], 200);
    }

    /**
     * Retorna todos os crachés (badges) do utilizador autenticado.
     * Inclui dados da categoria para cada badge.
     *
     * @param Request $request Pedido com utilizador autenticado
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection Coleção de badges
     */
    public function meBadges(Request $request)
    {
        return BadgeResource::collection(
            $request->user()->badges()->with('category')->get()
        );
    }
}
