<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'period' => $this['period'],
            'year' => $this['year'],
            'month' => $this['month'] ?? null,
            'days_in_month' => $this['days_in_month'] ?? null,
            'current_day' => $this['current_day'] ?? null,
            'total_weeks' => $this['total_weeks'] ?? null,
            'labels' => $this['labels'],
            'datasets' => [
                [
                    'label' => 'Novos Users',
                    'data' => $this['data'],
                    'borderColor' => '#FF5733',
                    'backgroundColor' => 'rgba(255, 87, 51, 0.1)',
                    'tension' => 0.1,
                ]
            ],
        ];
    }
}
