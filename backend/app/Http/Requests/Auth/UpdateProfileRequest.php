<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determina se o utilizador pode fazer este pedido.
     * Só utilizadores autenticados podem atualizar seu próprio perfil.
     *
     * @return bool true = autorizado
     */
    public function authorize(): bool
    {
        // Só utilizadores autenticados podem atualizar perfil
        return auth()->check();
    }

    /**
     * Define as regras de validação para atualização de perfil.
     * Permite atualizar: nome e email (ambos opcionais).
     *
     * Campos:
     *  - name: opcional, string, máximo 255 caracteres
     *  - email: opcional, email válido, máximo 255, único na tabela (exceto utilizador atual)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string> Regras
     */
    public function rules(): array
    {
        return [
            'name'  => ['sometimes', 'string', 'max:255'],  // Nome, opcional, até 255 chars
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()?->id),  // Único excepto utilizador atual
            ],
        ];
    }
}
