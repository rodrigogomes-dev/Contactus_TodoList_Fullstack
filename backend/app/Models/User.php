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
     * Define as conversões de tipos para os atributos do modelo.
     * Garante que determinados campos sejam automaticamente convertidos para tipos específicos.
     *
     * @return array<string, string> Mapa de atributos e seus tipos de conversão
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',  // Converte para data/hora
            'password' => 'hashed',             // Password é automaticamente hasheada
        ];
    }

    /**
     * Define relação: um utilizador tem muitas tarefas.
     * Uma tarefa pertence apenas a um utilizador.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Define relação: um utilizador tem muitos crachás (badges).
     * Uma badge pode pertencer a vários utilizadores.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function badges()
    {
        return $this->belongsToMany(Badge::class);
    }

    /**
     * Acesso computado: gera URL completa do avatar.
     * Se avatar_path estiver preenchido, devolve URL pública do armazenamento.
     * Caso contrário, devolve null para indicar que não há avatar.
     *
     * @return string|null URL completa do avatar ou null se não existir
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if ($this->avatar_path) {
            return asset('avatars/' . $this->avatar_path . '.png');
        }
        return null;
    }

    /**
     * Hook de ciclo de vida: executa automaticamente em eventos do modelo.
     * Responsável por encriptar o email quando um utilizador é criado ou atualizado.
     * Mantém sincronização entre email (visível) e email_encrypted (seguro).
     */
    protected static function booted(): void
    {
        // Quando um utilizador é CRIADO
        static::creating(function ($user) {
            // Se email existe e email_encrypted ainda não foi preenchido, encripta o email
            if ($user->email && !$user->email_encrypted) {
                $user->email_encrypted = Crypt::encryptString($user->email);
            }
        });

        // Quando um utilizador é ATUALIZADO
        static::updating(function ($user) {
            // Se o email foi modificado, atualiza também a versão encriptada
            if ($user->isDirty('email')) {
                $user->email_encrypted = Crypt::encryptString($user->email);
            }
        });
    }

    /**
     * Acesso computado: desencripta o email para fins de auditoria.
     * Tenta desencriptar o email_encrypted; se falhar, devolve 'N/A'.
     * Nunca exposição direta - apenas para lógica interna.
     *
     * @return string Email desencriptado ou 'N/A' se erro de desencriptação
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
