<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BadgeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nome' => $this->nome,
            'descricao' => $this->descricao,
            'icon' => $this->icon,
            'category_id' => $this->category_id,
            'milestone' => $this->milestone,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
