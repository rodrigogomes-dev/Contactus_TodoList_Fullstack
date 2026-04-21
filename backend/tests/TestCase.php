<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        
        // Iniciar transação para cada teste (sem limpar BD real)
        DB::beginTransaction();
    }

    protected function tearDown(): void
    {
        // Rollback da transação (reverte mudanças de teste, sem limpar dados originais)
        DB::rollBack();
        
        parent::tearDown();
    }
}
