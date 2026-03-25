<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'nome_categoria',
    ];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
