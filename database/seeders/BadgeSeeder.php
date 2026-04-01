<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Badge;

class BadgeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Cria apenas badges globais (sem categoria).
     * Badges por categoria são criadas automaticamente pelo CategoryObserver.
     */
    public function run(): void
    {
        // Badges globais - aplicam-se a todas as categorias agregadas
        $globalBadges = [
            [
                'nome' => 'Iniciante',
                'descricao' => 'Conclua sua primeira tarefa para ganhar esta badge.',
                'icon' => 'badge-iniciante',
                'category_id' => null,
                'milestone' => 'iniciante',
            ],
            [
                'nome' => 'Intermediário',
                'descricao' => 'Conclua 10 tarefas para ganhar esta badge.',
                'icon' => 'badge-intermediario',
                'category_id' => null,
                'milestone' => 'intermediário',
            ],
            [
                'nome' => 'Avançado',
                'descricao' => 'Conclua 50 tarefas para ganhar esta badge.',
                'icon' => 'badge-avancado',
                'category_id' => null,
                'milestone' => 'avançado',
            ],
            [
                'nome' => 'Especialista',
                'descricao' => 'Conclua 100 tarefas para ganhar esta badge.',
                'icon' => 'badge-especialista',
                'category_id' => null,
                'milestone' => 'especialista',
            ],
        ];

        // Usa firstOrCreate para idempotência (seguro rodar multiple times)
        foreach ($globalBadges as $badgeData) {
            Badge::firstOrCreate(
                [
                    'nome' => $badgeData['nome'],
                    'category_id' => null,
                    'milestone' => $badgeData['milestone'],
                ],
                [
                    'descricao' => $badgeData['descricao'],
                    'icon' => $badgeData['icon'],
                ]
            );
        }
        
        // Nota: Badges por categoria (ex: "Especialista em Informática") são criadas
        // automaticamente pelo CategoryObserver quando cada categoria é criada.
        // Não há duplicação - cada (category_id, milestone) é único.
    }
}
