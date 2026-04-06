<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Http\Requests\Auth\LoginUserRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\BadgeResource;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function register(RegisterUserRequest $request)
    {
        $user = User::create([
            'email' => $request->validated()['email'],
            'password' => Hash::make($request->validated()['password']),
            'name' => $request->validated()['email'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginUserRequest $request)
    {
        $user = User::where('email', $request->validated()['email'])->first();

        if (!$user || !Hash::check($request->validated()['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenciais inválidas',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        
        return response()->json([
            'message' => 'Logout bem-sucedido',
        ], 200);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('tasks', 'badges')),
        ], 200);
    }

    public function updateMe(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'user' => new UserResource($user->fresh()),
        ], 200);
    }

    public function meBadges(Request $request)
    {
        return BadgeResource::collection(
            $request->user()->badges()->with('category')->get()
        );
    }
}
