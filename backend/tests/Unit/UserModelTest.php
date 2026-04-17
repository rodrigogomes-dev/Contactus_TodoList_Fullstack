<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Task;
use App\Models\Category;
use App\Models\Badge;
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserModelTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user has many tasks
     */
    public function test_user_has_many_tasks(): void
    {
        $user = User::factory()->create();
        $tasks = Task::factory(3)->create(['user_id' => $user->id]);

        $this->assertCount(3, $user->tasks);
        $this->assertTrue($user->tasks->contains($tasks[0]));
    }

    /**
     * Test user belongs to many badges relationship
     */
    public function test_user_belongs_to_many_badges(): void
    {
        $user = User::factory()->create();
        
        // Test that the relationship collection exists and is iterable
        $this->assertIsIterable($user->badges);
        // Relationship works - badges collection can be accessed
    }

    /**
     * Test password is hashed
     */
    public function test_password_is_hashed(): void
    {
        $user = User::factory()->create([
            'password' => 'raw_password',
        ]);

        // Password should be hashed, not equal to raw value
        $this->assertNotEquals('raw_password', $user->password);
        // Verify it can be verified with Hash
        $this->assertTrue(\Hash::check('raw_password', $user->password));
    }

    /**
     * Test password is hidden in output
     */
    public function test_password_hidden_in_output(): void
    {
        $user = User::factory()->create();

        $json = $user->toJson();

        $this->assertStringNotContainsString('password', $json);
    }

    /**
     * Test avatar url accessor works
     */
    public function test_avatar_url_accessor_works(): void
    {
        $user = User::factory()->create([
            'avatar_path' => 'avatars/user123.jpg',
        ]);

        // avatar_url should be calculated
        $avatarUrl = $user->avatar_url;
        $this->assertStringContainsString('storage/avatars/user123.jpg', $avatarUrl);
    }

    /**
     * Test avatar url is null when no path
     */
    public function test_avatar_url_null_when_no_path(): void
    {
        $user = User::factory()->create([
            'avatar_path' => null,
        ]);

        $this->assertNull($user->avatar_url);
    }
}

