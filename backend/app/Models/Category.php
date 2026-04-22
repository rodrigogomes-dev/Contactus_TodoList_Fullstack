<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    /**
     * Atributos que podem ser atribuídos em massa (mass assignment).
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nome',  // Nome descritivo da categoria
        'cor',   // Cor hexadecimal da categoria (#RRGGBB)
    ];

    /**
     * Define relação: uma categoria tem muitas tarefas.
     * Inversa de Task::category().
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Define relação: uma categoria tem muitos crachás (badges).
     * Crachás são agrupados por categoria para milestones específicos.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function badges()
    {
        return $this->hasMany(Badge::class);
    }
}
