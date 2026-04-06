<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Task;
use App\Models\Category;
use App\Models\Badge;

class AdminController extends Controller
{
    /**
     * Get platform statistics
     */
    public function stats(Request $request)
    {
        return response()->json([
            'total_users' => User::count(),
            'total_categories' => Category::count(),
            'total_badges' => Badge::count(),
        ], 200);
    }
}
