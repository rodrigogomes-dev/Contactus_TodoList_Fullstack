<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    protected $fillable = [
        'nome',
        'descricao',
        'icon',
        'category_id',
        'milestone',
    ];

    protected $with = ['category'];

    protected $appends = ['icon_url', 'percentage'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function getIconUrlAttribute(): string
    {
        // Extrai cor da categoria com validação
        $color = $this->extractValidColor();
        
        // Seleciona ícone válido do Iconify baseado em milestone (com fallback)
        $iconName = $this->resolveIconName();

        // Constrói URL Iconify com parâmetros seguros
        return "https://api.iconify.design/{$iconName}.svg?color=%23{$color}&width=128&height=128";
    }

    /**
     * Extrai e valida cor hex da categoria.
     * Retorna cor válida ou fallback.
     */
    private function extractValidColor(): string
    {
        $fallbackColor = '000000';

        if (!$this->category || !$this->category->cor) {
            return $fallbackColor;
        }

        // Remove hashtag e valida formato hex
        $color = ltrim($this->category->cor, '#');
        
        // Verifica se é hex válido (3 ou 6 caracteres)
        if (preg_match('/^[0-9a-fA-F]{6}$/', $color)) {
            return strtolower($color);
        }

        return $fallbackColor;
    }

    /**
     * Resolve nome de ícone válido do Iconify.
     * Usa milestone como fonte de verdade, com fallback genérico.
     * Nunca retorna ícone inválido (evita 404s).
     */
    private function resolveIconName(): string
    {
        // Normaliza milestone para comparação (remove acentos conceitual)
        $normalizedMilestone = match($this->milestone) {
            'iniciante' => 'iniciante',
            'intermediário' => 'intermediário',
            'avançado' => 'avançado',
            'especialista' => 'especialista',
            default => null,
        };

        // Map robusto de milestone para Iconify icon (sempre válido)
        $iconMap = [
            'iniciante' => 'lsicon:refresh-done-filled',
            'intermediário' => 'lsicon:radar-chart-filled',
            'avançado' => 'lsicon:vip-filled',
            'especialista' => 'lsicon:education-filled',
        ];

        if ($normalizedMilestone && isset($iconMap[$normalizedMilestone])) {
            return $iconMap[$normalizedMilestone];
        }

        // Fallback genérico se milestone for null ou inválido
        return 'lsicon:badge-filled';
    }

    public function getPercentageAttribute(): float
    {
        $totalUsers = \App\Models\User::count();
        if ($totalUsers === 0) {
            return 0;
        }
        
        $usersWithBadge = $this->users()->count();
        return round(($usersWithBadge / $totalUsers) * 100, 2);
    }
}
