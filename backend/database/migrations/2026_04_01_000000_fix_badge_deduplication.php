<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Badge;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Remove badges duplicadas e normaliza nomes de milestone.
     * Garante: (category_id, milestone, nome) é único.
     */
    public function up(): void
    {
        // 1. Normaliza nomes de milestone para garantir consistência
        //    (em caso de variações com/sem acentos)
        $badges = Badge::all();
        foreach ($badges as $badge) {
            $normalized = $this->normalizeMilestone($badge->milestone);
            if ($normalized !== $badge->milestone) {
                $badge->milestone = $normalized;
                $badge->save();
            }
        }

        // 2. Remove badges duplicadas mantendo a primeira ocorrência
        //    Grupos por (category_id, milestone, nome)
        $duplicates = Badge::selectRaw('category_id, milestone, nome, COUNT(*) as cnt')
            ->groupBy('category_id', 'milestone', 'nome')
            ->having('cnt', '>', 1)
            ->get();

        foreach ($duplicates as $dup) {
            // Mantém o ID menor (primeiro criado), deleta o resto
            $toKeep = Badge::where('category_id', $dup->category_id)
                ->where('milestone', $dup->milestone)
                ->where('nome', $dup->nome)
                ->orderBy('id')
                ->first();

            if ($toKeep) {
                Badge::where('category_id', $dup->category_id)
                    ->where('milestone', $dup->milestone)
                    ->where('nome', $dup->nome)
                    ->where('id', '!=', $toKeep->id)
                    ->delete();
            }
        }

        // 3. Remove badges órfãs (categoria deletada mas badges permanecem)
        Badge::whereNotNull('category_id')
            ->whereNotIn('category_id', \DB::table('categories')->select('id'))
            ->delete();

        // 4. Adiciona índice único para prevenção futura de duplicação
        Schema::table('badges', function (Blueprint $table) {
            // Índice parcial: apenas para badges com milestone != null
            // Garante que não há duplica\u00e7\u00e3o de (category_id, milestone)
            $table->unique(['category_id', 'milestone'], 'unique_category_milestone')
                ->where('milestone', '!=', null);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('badges', function (Blueprint $table) {
            $table->dropUnique('unique_category_milestone');
        });
    }

    /**
     * Normaliza milestone para formato consistente.
     */
    private function normalizeMilestone(?string $milestone): ?string
    {
        if (!$milestone) {
            return null;
        }

        // Map de variações para normalizado
        $normalized = match(strtolower($milestone)) {
            'iniciante' => 'iniciante',
            'intermediário', 'intermediario' => 'intermediário',
            'avançado', 'avancado' => 'avançado',
            'especialista' => 'especialista',
            default => $milestone,
        };

        return $normalized;
    }
};
