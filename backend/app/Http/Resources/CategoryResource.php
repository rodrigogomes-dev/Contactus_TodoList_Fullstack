<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\BadgeResource;

class CategoryResource extends JsonResource
{
    /**
     * Transforma o recurso categoria num array para resposta JSON.
     * Inclui contagem de tarefas e coleção de badges.
     *
     * Campos:
     *  - Dados básicos: id, nome, cor (hexadecimal)
     *  - Estatísticas: tasks_count (número de tarefas nesta categoria)
     *  - Relacionamentos: badges (coleção de BadgeResource)
     *  - Timestamps: created_at, updated_at
     *
     * whenCounted(): inclui contagem apenas se foi carregada
     * whenLoaded(): inclui badges apenas se foram carregadas
     *
     * @param Request $request Pedido HTTP atual
     * @return array<string, mixed> Array transformado
     */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'nome'         => $this->nome,
            'cor'          => $this->cor,
            'tasks_count'  => $this->whenCounted('tasks'),                              // Contagem de tarefas se carregada
            'badges'       => BadgeResource::collection($this->whenLoaded('badges')),  // Badges se carregadas
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}
