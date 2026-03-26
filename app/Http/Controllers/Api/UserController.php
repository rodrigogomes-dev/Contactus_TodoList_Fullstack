<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Upload user avatar
     */
    public function uploadAvatar(Request $request)
    {
        $validated = $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_path' => $path]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'user' => $user->load('badges', 'tasks'),
        ], 200);
    }

    /**
     * Get user rankings by badges count
     */
    public function rankings()
    {
        $rankings = \App\Models\User::withCount('badges')
            ->withCount(['tasks' => function ($query) {
                $query->where('estado', 'concluída');
            }])
            ->orderBy('badges_count', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar_url' => $user->avatar_url,
                    'badges_count' => $user->badges_count,
                    'tasks_completed' => $user->tasks_count,
                    'badges' => $user->badges,
                ];
            });

        return response()->json($rankings, 200);
    }
}
