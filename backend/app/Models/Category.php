<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'nome',
        'cor',
    ];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function badges()
    {
        return $this->hasMany(Badge::class);
    }
}
