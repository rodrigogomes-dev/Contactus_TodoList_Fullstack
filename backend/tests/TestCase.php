<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    /**
     * Configuração inicial executada ANTES de cada teste.
     * Inicia uma transação de BD para isolar este teste de outros.
     *
     * Estratégia:
     *  1. Carrega bootstrapping do Laravel
     *  2. Inicia transação de BD
     *  3. Teste executa dentro da transação
     *
     * Benefício: Mudanças de teste são revertidas automaticamente
     *           Sem precisar de RefreshDatabase (mais rápido)
     *           Database de teste fica limpa entre testes
     */
    protected function setUp(): void
    {
        parent::setUp();
        
        // Inicia uma transação de base de dados
        // Todas as operações deste teste ficarão dentro desta transação
        DB::beginTransaction();
    }

    /**
     * Limpeza executada DEPOIS de cada teste.
     * Reverte a transação para descartar mudanças do teste.
     *
     * Fluxo:
     *  1. Teste termina
     *  2. rollBack() desfaz TODAS as mudanças na BD
     *  3. Database fica no estado original (como se teste nunca aconteceu)
     *  4. Próximo teste começa com BD limpa
     *
     * Nota: Muito mais rápido que RefreshDatabase
     *       Não precisa de truncar tabelas
     *       Preserva schema
     */
    protected function tearDown(): void
    {
        // Reverte a transação (desfaz todas as operações deste teste)
        DB::rollBack();
        
        // Chamar parent para limpeza do framework
        parent::tearDown();
    }
}
