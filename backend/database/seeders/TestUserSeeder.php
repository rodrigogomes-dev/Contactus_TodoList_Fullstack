<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // User Normal
        User::create([
            'name' => 'João Silva',
            'email' => 'joao@teste.com',
            'password' => Hash::make('password123'),
            'is_admin' => false,
            'avatar_path' => 'avatar-1',
        ]);

        // User Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@teste.com',
            'password' => Hash::make('admin123'),
            'is_admin' => true,
            'avatar_path' => 'avatar-2',
        ]);
    }
}
