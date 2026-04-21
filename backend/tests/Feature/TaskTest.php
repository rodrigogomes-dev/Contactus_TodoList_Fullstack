<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Task;
use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class TaskTest extends TestCase
{

    private User $user;
    private User $otherUser;
    private Category $category;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
        $this->category = Category::factory()->create();
        $this->token = $this->user->createToken('auth_token')->plainTextToken;
    }

    /**
     * Test authenticated user can create a task
     */
    public function test_authenticated_user_can_create_task(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson('/api/tasks', [
                'titulo' => 'My first task',
                'descricao' => 'Task description',
                'prioridade' => 'alta',
                'estado' => 'pendente',
                'category_id' => $this->category->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'titulo', 'prioridade', 'user_id', 'category_id']
            ])
            ->assertJson([
                'data' => [
                    'titulo' => 'My first task',
                    'user_id' => $this->user->id,
                ]
            ]);

        $this->assertDatabaseHas('tasks', [
            'titulo' => 'My first task',
            'user_id' => $this->user->id,
        ]);
    }

    /**
     * Test cannot create task with invalid category
     */
    public function test_cannot_create_task_with_invalid_category(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson('/api/tasks', [
                'titulo' => 'Task',
                'descricao' => 'Description',
                'prioridade' => 'media',
                'estado' => 'pendente',
                'category_id' => 9999, // Non-existent
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category_id']);
    }

    /**
     * Test user sees only their own tasks
     */
    public function test_user_sees_only_own_tasks(): void
    {
        Task::factory()->create(['user_id' => $this->user->id]);
        Task::factory()->create(['user_id' => $this->user->id]);
        Task::factory()->create(['user_id' => $this->otherUser->id]); // Other user's task

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data'); // Only the 2 tasks of current user

        $response->assertJson([
            'data' => [
                ['user_id' => $this->user->id],
                ['user_id' => $this->user->id],
            ]
        ]);
    }

    /**
     * Test user cannot see other user's tasks directly
     */
    public function test_user_cannot_see_other_users_tasks(): void
    {
        $otherUserTask = Task::factory()->create(['user_id' => $this->otherUser->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->getJson("/api/tasks/{$otherUserTask->id}");

        $response->assertStatus(403);
    }

    /**
     * Test user can update their own task
     */
    public function test_user_can_update_own_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->putJson("/api/tasks/{$task->id}", [
                'titulo' => 'Updated Title',
                'descricao' => 'Updated description',
                'prioridade' => 'baixa',
                'estado' => 'concluída',
                'category_id' => $this->category->id,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'titulo' => 'Updated Title',
                'estado' => 'concluída',
            ]);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'titulo' => 'Updated Title',
        ]);
    }

    /**
     * Test user cannot update other user's task
     */
    public function test_user_cannot_update_other_users_task(): void
    {
        $otherUserTask = Task::factory()->create(['user_id' => $this->otherUser->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->putJson("/api/tasks/{$otherUserTask->id}", [
                'titulo' => 'Hacked title',
                'prioridade' => 'alta',
                'estado' => 'concluída',
                'category_id' => $this->category->id,
            ]);

        $response->assertStatus(403);

        // Verify task was not updated
        $this->assertDatabaseMissing('tasks', [
            'id' => $otherUserTask->id,
            'titulo' => 'Hacked title',
        ]);
    }

    /**
     * Test user can delete their own task
     */
    public function test_user_can_delete_own_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('tasks', [
            'id' => $task->id,
        ]);
    }

    /**
     * Test user cannot delete other user's task
     */
    public function test_user_cannot_delete_other_users_task(): void
    {
        $otherUserTask = Task::factory()->create(['user_id' => $this->otherUser->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->deleteJson("/api/tasks/{$otherUserTask->id}");

        $response->assertStatus(403);

        // Verify task still exists
        $this->assertDatabaseHas('tasks', [
            'id' => $otherUserTask->id,
        ]);
    }

    /**
     * Test task creation requires titulo and prioridade
     */
    public function test_task_requires_titulo_and_prioridade(): void
    {
        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->postJson('/api/tasks', [
                'descricao' => 'No title no priority',
                'category_id' => $this->category->id,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['titulo', 'prioridade', 'estado']);
    }

    /**
     * Test task returns related user and category
     */
    public function test_task_returns_related_user_and_category(): void
    {
        $task = Task::factory()->create([
            'user_id' => $this->user->id,
            'category_id' => $this->category->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'titulo', 'user', 'category']
                ]
            ]);
    }

    /**
     * Test pagination works on tasks endpoint
     */
    public function test_pagination_works(): void
    {
        // Create 20 tasks (more than default 15 per page)
        Task::factory(20)->create(['user_id' => $this->user->id]);

        $response = $this->withHeader('Authorization', "Bearer $this->token")
            ->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data',
                'links',
                'meta' => ['current_page', 'last_page', 'per_page', 'total']
            ])
            ->assertJsonCount(15, 'data'); // Default 15 per page
    }

    /**
     * Test task create should trigger observer
     */
    public function test_task_create_triggers_observer(): void
    {
        $this->expectsDatabaseQueryCount(11); // Account for factory creation queries

        $task = Task::factory()->create(['user_id' => $this->user->id]);

        // Verify task exists and has timestamps
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'created_at' => $task->created_at,
        ]);
    }
}
