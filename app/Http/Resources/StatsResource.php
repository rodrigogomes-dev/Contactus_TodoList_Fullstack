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
            'period' => $this->resource['period'],
            'year' => $this->resource['year'],
            'month' => $this->resource['month'] ?? null,
            'days_in_month' => $this->resource['days_in_month'] ?? null,
            'current_day' => $this->resource['current_day'] ?? null,
            'total_weeks' => $this->resource['total_weeks'] ?? null,
            'labels' => $this->resource['labels'],
            'datasets' => [
                [
                    'label' => 'Novos Users',
                    'data' => $this->resource['data'],
                    'borderColor' => '#FF5733',
                    'backgroundColor' => 'rgba(255, 87, 51, 0.1)',
                    'tension' => 0.1,
                ]
            ],
        ];
    }
}
