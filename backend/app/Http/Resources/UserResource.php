<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transforma o recurso utilizador num array para resposta JSON.
     * Controla quais os campos que são devolvidos e a quais utilizadores.
     *
     * Visibilidade de campos:
     *  - is_admin: visível apenas se:
     *    - utilizador não está autenticado, OU
     *    - utilizador autenticado está a ver o seu próprio perfil, OU
     *    - utilizador autenticado é administrador
     *  - Outros campos: sempre visíveis
     *
     * Nota: email_encrypted é NÃO incluído (apenas para segurança interna)
     *
     * @param Request $request Pedido HTTP atual (para contexto de autenticação)
     * @return array<string, mixed> Array transformado com campos filtrados
     */
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'avatar_url' => $this->avatar_url,
            // Campo is_admin com lógica de visibilidade
            'is_admin'   => $this->when(
                !$request->user() || $request->user()?->id === $this->id || $request->user()?->is_admin,
                $this->is_admin
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
