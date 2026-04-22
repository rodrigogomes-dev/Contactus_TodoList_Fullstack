<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Task;
use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class TaskModelTest extends TestCase
{
    /**
     * Teste: tarefa pertence a um utilizador.
     * 
     * Verifica:
     *  - Relação belongsTo funciona
     *  - $task->user retorna utilizador correto
     */
    public function test_task_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->create(['user_id' => $user->id]);

        $this->assertTrue($task->user()->is($user));
    }

    /**
     * Test task belongs to category
     */
    public function test_task_belongs_to_category(): void
    {
        $category = Category::factory()->create();
        $task = Task::factory()->create(['category_id' => $category->id]);

        $this->assertTrue($task->category()->is($category));
    }

    /**
     * Teste: timestamps são convertidos para Carbon dates.
     * 
     * Verifica:
     *  - created_at e updated_at são instâncias de Carbon
     *  - Podem ser manipulados como objetos de data
     */
    public function test_timestamps_are_cast(): void
    {
        $task = Task::factory()->create();

        $this->assertInstanceOf(\Carbon\Carbon::class, $task->created_at);
        $this->assertInstanceOf(\Carbon\Carbon::class, $task->updated_at);
    }

    /**
     * Test task fillable attributes
     */
    public function test_task_fillable_attributes(): void
    {
        $data = [
            'titulo' => 'Test Task',
            'descricao' => 'Description',
            'prioridade' => 'alta',
            'estado' => 'pendente',
            'data_vencimento' => now(),
            'user_id' => User::factory()->create()->id,
            'category_id' => Category::factory()->create()->id,
        ];

        $task = Task::create($data);

        foreach ($data as $key => $value) {
            if ($key !== 'data_vencimento') {
                $this->assertEquals($value, $task->$key);
            }
        }
    }

}
