<?php

namespace App\Http\Requests\Stats;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class GetUsersGrowthRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Apenas admins podem ver stats
        return $this->user() && $this->user()->is_admin;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'period' => 'required|in:year,month',
            'year' => 'required|integer|min:2026|max:' . now()->year,
            'month' => 'sometimes|required_if:period,month|integer|min:1|max:12',
        ];
    }
}
