<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Task;
use App\Models\Category;
use App\Models\Badge;
use Illuminate\Foundation\Testing\DatabaseMigrations;

class CategoryModelTest extends TestCase
{

    /**
     * Test category has many tasks
     */
    public function test_category_has_many_tasks(): void
    {
        $category = Category::factory()->create();
        Task::factory(3)->create(['category_id' => $category->id]);

        $this->assertCount(3, $category->tasks);
    }

    /**
     * Test category has many badges relationship
     */
    public function test_category_has_many_badges(): void
    {
        $category = Category::factory()->create();
        
        // Verify the relationship is properly configured
        $this->assertIsIterable($category->badges);
        // Relationship works - badges collection can be accessed
    }
}
