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
        $color = '000000'; // Cor Base Fallback
        
        // Remove a hashtag do CSS se ela constar no Registo da Base de Dados
        if ($this->category && $this->category->cor) {
            $color = ltrim($this->category->cor, '#');
        }

        $iconName = match($this->milestone) {
            'iniciante' => 'lsicon:refresh-done-filled',
            'intermediário' => 'lsicon:radar-chart-filled',
            'avançado' => 'lsicon:vip-filled',
            'especialista' => 'lsicon:education-filled',
            default => 'lsicon:badge-filled', // O "Pai" Genérico da Categoria
        };

        // Deville um SVG escalável à cor dinâmica da Categoria
        return "https://api.iconify.design/{$iconName}.svg?color=%23{$color}&width=128&height=128";
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
