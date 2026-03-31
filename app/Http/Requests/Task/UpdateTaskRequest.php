<?php

namespace App\Http\Requests\Task;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Verificado no Controller (ownership de tarefa)
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        // PATCH: todos os campos opcionais
        return [
            'titulo' => 'sometimes|required|string|max:255',
            'descricao' => 'nullable|string',
            'prioridade' => 'sometimes|required|in:baixa,média,alta',
            'data_vencimento' => 'nullable|date',
            'user_id' => 'sometimes|required|exists:users,id',
            'category_id' => 'sometimes|required|exists:categories,id',
            'estado' => 'sometimes|required|in:pendente,concluído',
        ];
    }
}
