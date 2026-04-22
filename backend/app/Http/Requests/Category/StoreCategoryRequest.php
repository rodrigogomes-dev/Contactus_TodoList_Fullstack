<?php

namespace App\Http\Requests\Category;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determina se o utilizador pode fazer este pedido.
     * Só administradores podem criar categorias.
     * Validação adicional via Gates/Policies no controller.
     *
     * @return bool true = autorizado (administrador)
     */
    public function authorize(): bool
    {
        // Apenas administradores podem criar categorias
        return $this->user() && $this->user()->is_admin;
    }

    /**
     * Define as regras de validação para criação de categoria.
     *
     * Campos:
     *  - nome: obrigatório, string, máximo 255 caracteres, único na tabela
     *  - cor: obrigatório, formato hexadecimal (#RRGGBB)
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string> Regras
     */
    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255|unique:categories',  // Nome único, obrigatório
            'cor'  => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',  // Cor hexadecimal (ex: #FF0000)
        ];
    }
}
