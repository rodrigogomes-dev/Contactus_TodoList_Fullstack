<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\BadgeResource;

class CategoryResource extends JsonResource
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
            'cor' => $this->cor,
            'tasks_count' => $this->whenCounted('tasks'),
            'badges' => BadgeResource::collection($this->whenLoaded('badges')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
