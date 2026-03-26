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

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function getIconUrlAttribute(): string
    {
        return "https://api.dicebear.com/7.x/identicons/svg?seed={$this->icon}";
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
