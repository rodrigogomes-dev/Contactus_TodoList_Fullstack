<?php

namespace App\Http\Requests\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UploadAvatarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Apenas o user autenticado pode fazer upload do seu próprio avatar
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240',
        ];
    }

    /**
     * Get custom error messages
     */
    public function messages(): array
    {
        return [
            'avatar.required' => 'Avatar file is required',
            'avatar.image' => 'The file must be an image',
            'avatar.mimes' => 'The image must be jpeg, png, jpg, or gif',
            'avatar.max' => 'The image size must not exceed 10MB',
        ];
    }
}
