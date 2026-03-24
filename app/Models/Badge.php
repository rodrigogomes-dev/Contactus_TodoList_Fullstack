<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function getIconUrlAttribute(): string
    {
        return "https://api.dicebear.com/7.x/identicons/svg?seed={$this->icon}";
    }
}
