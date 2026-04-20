<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class CategoryPolicy
{
    public function create(User $user): bool
    {
        return $user->is_admin;
    }

    public function update(User $user, Category $category): bool
    {
        return $user->is_admin;
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->is_admin;
    }
}
