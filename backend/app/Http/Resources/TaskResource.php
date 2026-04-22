<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    /**
     * Transforma o recurso tarefa num array para resposta JSON.
     * Inclui dados da tarefa + relações carregadas (user, category).
     *
     * Campos:
     *  - Dados básicos: id, título, descrição, estado, prioridade
     *  - Data: data_vencimento, criação, atualização
     *  - Relacionamentos: user (UserResource), category (CategoryResource)
     *  - Origem: user_id, category_id (IDs puros)
     *
     * whenLoaded(): inclui relação apenas se foi carregada para evitar queries N+1
     *
     * @param Request $request Pedido HTTP atual
     * @return array<string, mixed> Array transformado
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'titulo'            => $this->titulo,
            'descricao'         => $this->descricao,
            'estado'            => $this->estado,
            'prioridade'        => $this->prioridade,
            'data_vencimento'   => $this->data_vencimento,
            'user_id'           => $this->user_id,
            'category_id'       => $this->category_id,
            'user'              => new UserResource($this->whenLoaded('user')),              // Carregado se disponível
            'category'          => new CategoryResource($this->whenLoaded('category')),     // Carregado se disponível
            'created_at'        => $this->created_at,
            'updated_at'        => $this->updated_at,
        ];
    }
}
