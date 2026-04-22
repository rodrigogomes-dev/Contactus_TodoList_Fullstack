<?php

namespace App\Http\Requests\Task;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determina se o utilizador pode fazer este pedido.
     * Só utilizadores autenticados podem criar tarefas.
     *
     * @return bool true = autorizado
     */
    public function authorize(): bool
    {
        // Qualquer utilizador autenticado pode criar as suas próprias tarefas
        return auth()->check();
    }

    /**
     * Define as regras de validação para criação de tarefa.
     *
     * Campos esperados:
     *  - titulo: obrigatório, string, máximo 255 caracteres
     *  - descricao: opcional, string (sem limite)
     *  - prioridade: obrigatório, uma de: baixa, média, alta
     *  - data_vencimento: opcional, data válida
     *  - category_id: obrigatório, ID de categoria existente
     *  - estado: obrigatório, uma de: pendente, concluída
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string> Regras
     */
    public function rules(): array
    {
        return [
            'titulo'            => 'required|string|max:255',                  // Título, obrigatório
            'descricao'         => 'nullable|string',                         // Descrição, opcional
            'prioridade'        => 'required|in:baixa,média,alta',          // Prioridade, um destes valores
            'data_vencimento'   => 'nullable|date',                          // Data limite, opcional, formato data
            'category_id'       => 'required|exists:categories,id',          // Categoria, obrigatória, deve existir
            'estado'            => 'required|in:pendente,concluída',         // Estado, obrigatório
        ];
    }
}
