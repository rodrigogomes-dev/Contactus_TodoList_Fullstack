<?php

namespace App\Http\Requests\Category;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Apenas admins podem atualizar categorias
        return $this->user() && $this->user()->is_admin;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        $categoryId = $this->route('category'); // Assume rota com parameter {category}
        
        return [
            'nome' => 'sometimes|required|string|max:255|unique:categories,nome,' . $categoryId,
            'cor' => 'sometimes|required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ];
    }
}
