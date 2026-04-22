<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterUserRequest extends FormRequest
{
    /**
     * Determina se o utilizador pode fazer este pedido.
     * Registo é público: qualquer pessoa (autenticada ou não) pode registar-se.
     *
     * @return bool true = autorizado, false = 403 Forbidden
     */
    public function authorize(): bool
    {
        // Qualquer pessoa pode registar-se (não requer autenticação)
        return true;
    }

    /**
     * Define as regras de validação para este pedido.
     * Valida campos de email e password para novo registo.
     *
     * Regras:
     *  - email: obrigatório, deve ser email válido, único na tabela users
     *  - password: obrigatório, mínimo 6 caracteres, confirmado (password_confirmation deve coincidir)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string> Regras de validação
     */
    public function rules(): array
    {
        return [
            'email'    => 'required|email|unique:users',  // Obrigatório, email válido, único
            'password' => 'required|string|min:6|confirmed',  // Obrigatório, confirmado (password_confirmation)
        ];
    }
}
