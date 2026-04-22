<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory;

    /**
     * Atributos que podem ser atribuídos em massa (mass assignment).
     * Define quais os campos que podem ser preenchidos via create() ou update().
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'titulo',           // Título descritivo da tarefa
        'descricao',        // Descrição detalhada
        'estado',           // Estado atual: pendente, concluída, cancelada
        'prioridade',       // Nível: baixa, média, alta
        'data_vencimento',  // Data limite para completar
        'user_id',          // ID do utilizador proprietário
        'category_id',      // ID da categoria associada
    ];

    /**
     * Define relação: uma tarefa pertence a um utilizador.
     * Inversa de User::tasks().
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Define relação: uma tarefa pertence a uma categoria.
     * Uma categoria pode ter muitas tarefas.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

}
