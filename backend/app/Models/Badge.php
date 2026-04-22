<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Badge extends Model
{
    use HasFactory;

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

    /**
     * Acesso computado: gera URL completa do ícone da badge.
     * Integra com API Iconify para renderização dinâmica de ícones.
     * Garante que cor e ícone são sempre válidos (sem 404s).
     *
     * @return string URL SVG do Iconify com cor e dimensões corretas
     */
    public function getIconUrlAttribute(): string
    {
        // Extrai cor hexadecimal da categoria associada (com validação)
        $color = $this->extractValidColor();
        
        // Resolve nome do ícone válido baseado no milestone (com fallback)
        $iconName = $this->resolveIconName();

        // Constrói URL Iconify parametrizada com cores e dimensões
        return "https://api.iconify.design/{$iconName}.svg?color=%23{$color}&width=128&height=128";
    }

    /**
     * Extrai e valida a cor hexadecimal da categoria.
     * Garante que sempre retorna um valor hexadecimal válido.
     *
     * Processo:
     *  1. Obtém cor da categoria associada
     *  2. Remove hashtag (#) se presente
     *  3. Valida formato hexadecimal (6 dígitos)
     *  4. Se inválida, retorna fallback preto (000000)
     *
     * @return string Cor hexadecimal validada, sem hashtag (ex: "ff0000")
     */
    private function extractValidColor(): string
    {
        // Cor padrão caso nenhuma cor válida seja encontrada
        $fallbackColor = '000000';

        // Se categoria não existe ou não tem cor definida, usa padrão
        if (!$this->category || !$this->category->cor) {
            return $fallbackColor;
        }

        // Remove hashtag inicial se presente
        $color = ltrim($this->category->cor, '#');
        
        // Valida formato: exatamente 6 dígitos hexadecimais
        if (preg_match('/^[0-9a-fA-F]{6}$/', $color)) {
            return strtolower($color);
        }

        // Se formato inválido, retorna cor padrão
        return $fallbackColor;
    }

    /**
     * Resolve o nome do ícone Iconify baseado no milestone da badge.
     * Garante que sempre retorna um ícone válido (sem 404s).
     *
     * Estratégia:
     *  - Normaliza milestone para comparação
     *  - Usa mapa hardcoded de milestone → ícone Iconify
     *  - Se milestone inválido/null, retorna fallback genérico
     *  - Nunca retorna ícone inexistente
     *
     * @return string Nome do ícone Iconify válido (ex: "lsicon:education-filled")
     */
    private function resolveIconName(): string
    {
        // Normaliza milestone para formato padrão de comparação
        $normalizedMilestone = match($this->milestone) {
            'iniciante'      => 'iniciante',
            'intermediário'  => 'intermediário',
            'avançado'       => 'avançado',
            'especialista'   => 'especialista',
            default          => null,
        };

        // Mapa robusto de milestone → ícone Iconify (todos validados)
        $iconMap = [
            'iniciante'      => 'lsicon:refresh-done-filled',      // Iniciante: ícone de conclusão
            'intermediário'  => 'lsicon:radar-chart-filled',       // Intermediário: radar/análise
            'avançado'       => 'lsicon:vip-filled',               // Avançado: VIP
            'especialista'   => 'lsicon:education-filled',         // Especialista: educação
        ];

        // Se milestone normalizado existe no mapa, usa-o
        if ($normalizedMilestone && isset($iconMap[$normalizedMilestone])) {
            return $iconMap[$normalizedMilestone];
        }

        // Se milestone for null ou inválido, usa fallback genérico
        return 'lsicon:badge-filled';
    }

    /**
     * Acesso computado: calcula percentagem de utilizadores com esta badge.
     * Usado para visualização de progresso/raridade da badge.
     *
     * Cálculo:
     *  - Conta total de utilizadores na plataforma
     *  - Conta quantos têm esta badge específica
     *  - Retorna percentagem arredondada a 2 casas decimais
     *  - Retorna 0 se não houver utilizadores
     *
     * @return float Percentagem de utilizadores com esta badge (0-100)
     */
    public function getPercentageAttribute(): float
    {
        // Conta total de utilizadores registados
        $totalUsers = \App\Models\User::count();
        
        // Se não há utilizadores, retorna 0%
        if ($totalUsers === 0) {
            return 0;
        }
        
        // Conta quantos utilizadores têm especificamente esta badge
        $usersWithBadge = $this->users()->count();
        
        // Calcula percentagem arredondada a 2 casas decimais
        return round(($usersWithBadge / $totalUsers) * 100, 2);
    }
}
