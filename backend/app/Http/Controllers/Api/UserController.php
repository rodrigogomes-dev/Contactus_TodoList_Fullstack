<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\User\UploadAvatarRequest;

class UserController extends Controller
{
    /**
     * Upload user avatar
     */
    public function uploadAvatar(UploadAvatarRequest $request)
    {
        $validated = $request->validated();

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
}
