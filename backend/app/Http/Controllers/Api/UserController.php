<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\User\UploadAvatarRequest;
use App\Http\Requests\User\SelectAvatarRequest;

class UserController extends Controller
{
    /**
     * Faz upload de avatar para o utilizador autenticado.
     * Armazena imagem em storage/public/avatars/
     * Remove avatar anterior se existir.
     *
     * Fluxo:
     *  1. Valida ficheiro de imagem
     *  2. Se avatar anterior existe, deleta-o
     *  3. Armazena nova imagem
     *  4. Atualiza avatar_path do utilizador
     *  5. Retorna utilizador com dados atualizados
     *
     * Nota: avatar_url é computada automaticamente no modelo User
     *
     * @param UploadAvatarRequest $request Ficheiro de imagem validado
     * @return \Illuminate\Http\JsonResponse Utilizador atualizado, HTTP 200
     */
    public function uploadAvatar(UploadAvatarRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        // Remove avatar anterior se existir (limpeza de storage)
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Armazena novo avatar na pasta 'avatars' do storage púbico
        $path = $request->file('avatar')->store('avatars', 'public');
        
        // Atualiza registo do utilizador com novo caminho
        $user->update(['avatar_path' => $path]);

        return response()->json([
            'message' => 'Avatar carregado com sucesso',
            'user'    => $user->load('badges', 'tasks'),
        ], 200);
    }

    /**
     * Seleciona um avatar pré-definido da biblioteca.
     * Apenas atualiza avatar_path para referência local (ex: 'avatar-1').
     *
     * @param SelectAvatarRequest $request Avatar name validado (avatar-1 até avatar-10)
     * @return \Illuminate\Http\JsonResponse Utilizador atualizado, HTTP 200
     */
    public function selectAvatar(SelectAvatarRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        // Atualiza avatar_path com o nome do avatar selecionado
        $user->update(['avatar_path' => $validated['avatar_name']]);

        return response()->json([
            'message' => 'Avatar selecionado com sucesso',
            'user'    => $user->load('badges', 'tasks'),
        ], 200);
    }
}
