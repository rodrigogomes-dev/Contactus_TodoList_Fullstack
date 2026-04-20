<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Crypt;

#[Fillable(['name', 'email', 'password', 'avatar_path', 'is_admin'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    protected $appends = ['avatar_url'];
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class);
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if ($this->avatar_path) {
            return asset('storage/' . $this->avatar_path);
        }
        return null;
    }

    protected static function booted(): void
{
    static::creating(function ($user) {
        if ($user->email && !$user->email_encrypted) {
            $user->email_encrypted = Crypt::encryptString($user->email);
        }
    });

    static::updating(function ($user) {
        if ($user->isDirty('email')) {
            $user->email_encrypted = Crypt::encryptString($user->email);
        }
    });
}

    /**
     * Obter email desencriptado (para auditoria)
     */
    public function getEmailDecryptedAttribute(): string
    {
        try {
            return Crypt::decryptString($this->email_encrypted);
        } catch (\Exception $e) {
            return 'N/A';
        }
    }
}
