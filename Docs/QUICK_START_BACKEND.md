# QUICK START - Backend (Laravel) - Desenvolvimento Local

> ⚠️ **Se está a usar Docker, vá para [DOCKER_README.md](../DOCKER_README.md)**

Este guia é **APENAS** para desenvolvimento local sem Docker.

---

## 🎯 Setup em 5 minutos

### 1. Pré-requisitos

```bash
php --version          # PHP 8.2+
mysql --version        # MySQL 8.0+
composer --version     # Composer
```

### 2. Instalar dependências

```bash
cd backend
composer install
```

### 3. Configurar ambiente

```bash
cp .env.example .env
php artisan key:generate
```

Verificar `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=db_todolist_contactus
DB_USERNAME=root
DB_PASSWORD=mysql
```

### 4. Criar BD e tabelas

```bash
mysql -u root -pmysql -e "CREATE DATABASE db_todolist_contactus;"
php artisan migrate:fresh --seed
```

### 5. Iniciar servidor

```bash
php artisan serve
```

Acesso: **http://localhost:8000/api**

---

## 🧪 Testes

```bash
npm test
```

**Resultado esperado:**
```
✓ Dropped all tables successfully
✓ Migration for user creation
✓ Seeders executados (8 utilizadores, 8 categorias, 36 badges)
```

### 6️⃣ Criar symlink de storage (para avatares)

```bash
php artisan storage:link
```

**Resultado esperado:**
```
✓ The [public/storage] link has been connected to [storage/app/public]
```

---

## 🎬 Iniciar o Servidor

### Opção 1: Laravel Built-in Server (Recomendado para desenvolvimento)

```bash
php artisan serve
```

**Resultado esperado:**
```
Laravel development server started: http://127.0.0.1:8000
```

Acessível em: **http://localhost:8000**

### Opção 2: Com Host e Porta Específicos

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### Parar o servidor

Pressionar `Ctrl+C` no terminal

---

## ✅ Testar o Servidor

### Testar conexão com API

```bash
# GET healthcheck
curl -X GET http://localhost:8000/api -w "\nStatus: %{http_code}\n"

# POST login (credenciais de teste)
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testadmin@example.com","password":"password123"}'
```

---

## 📊 Estrutura de Dados

### Tabelas Criadas

```
✓ users (8 registos)
✓ tasks (21 registos)
✓ categories (8 registos)
✓ badges (36 registos)
✓ badge_user (18 registos - relação N-N)
✓ personal_access_tokens (20 registos - Sanctum)
✓ migrations (14 registos)
```

### Dados de Teste

**Utilizador Admin:**
```
email: testadmin@example.com
password: password123
is_admin: true
```

**Utilizadores Normais:** 7 outros utilizadores com tarefas e badges

---

## 🛠️ Comandos Úteis

### Database

```bash
# Ver status das migrations
php artisan migrate:status

# Fazer rollback da última migration
php artisan migrate:rollback

# Resetar BD completamente (dados apagados)
php artisan migrate:reset

# Recriar BD do zero (fresh) + seeding
php artisan migrate:fresh --seed

# Apenas executar seeders (BD já existe)
php artisan db:seed
```

### Cache e Config

```bash
# Limpar cache da aplicação
php artisan cache:clear

# Limpar cache de configuração
php artisan config:clear

# Recarregar configuração
php artisan config:cache

# Limpar tudo
php artisan optimize:clear
```

### Tinker (REPL Interativo)

```bash
# Iniciar shell PHP com contexto Laravel
php artisan tinker

# Exemplos dentro de tinker:
> User::all()
> User::find(1)->tasks
> Task::where('estado', 'pendente')->count()
> exit
```

---

## 🔍 Debug & Troubleshooting

### Problema: "No application encryption key has been generated"

**Solução:**
```bash
php artisan key:generate
```

### Problema: "SQLSTATE[HY000] [1045] Access denied for user 'root'"

**Causa:** Password em `.env` incorreta

**Solução:**
1. Verificar password MySQL: `sudo mysql -u root`
2. Atualizar `.env`: `DB_PASSWORD=correct_password`

### Problema: "No such file or directory: artisan"

**Causa:** Está na pasta errada

**Solução:**
```bash
cd backend
php artisan serve
```

### Problema: "SQLSTATE[HY000]: General error: 2003 Can't connect to MySQL server"

**Causa:** MySQL não está a correr

**Solução:**
```bash
# Ubuntu/Debian
sudo service mysql start

# macOS
brew services start mysql

# Verificar se está a correr
ps aux | grep mysql
```

### Ver logs de erro

```bash
# Tail do log
tail -f storage/logs/laravel.log

# Ver últimas 50 linhas
tail -50 storage/logs/laravel.log

# Buscar erro específico
grep "ERROR" storage/logs/laravel.log
```

---

## 📁 Estrutura de Pastas

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/       # Controllers REST
│   │   ├── Middleware/            # IsAdmin, HandleCors
│   │   ├── Requests/              # Validáções de input
│   │   └── Resources/             # JSON transformations
│   ├── Models/                    # Eloquent models
│   ├── Observers/                 # Gamificação automation
│   └── ...
├── routes/
│   ├── api.php                    # Rotas API
│   └── web.php
├── database/
│   ├── migrations/                # Schema criação
│   └── seeders/                   # Dados iniciais
├── storage/
│   ├── app/
│   │   └── public/
│   │       └── avatars/           # Avatares de users
│   ├── logs/                      # Ficheiros de log
│   └── ...
├── public/
│   ├── storage → ../storage/app/public
│   └── index.php
├── .env                           # Configuração (não versioned)
├── .env.example                   # Template
├── composer.json
├── artisan                        # CLI
└── ...
```

---

## 🎓 Próximos Steps

1. **Testar Frontend:** [QUICK_START_FRONTEND.md](../frontend/QUICK_START_FRONTEND.md)
2. **Ver Queries:** [Relevant_Querys.txt](../frontend/Docs/Relevant_Querys.txt)
3. **Explorar API:** Use Postman/Swagger com as rotas em `routes/api.php`
4. **Modificar Seeders:** Editar `database/seeders/` para mudar dados iniciais

---

## 📚 Documentação Oficial

- [Laravel Docs](https://laravel.com/docs/11)
- [Eloquent ORM](https://laravel.com/docs/11/eloquent)
- [Sanctum Auth](https://laravel.com/docs/11/sanctum)
- [API Resources](https://laravel.com/docs/11/eloquent-resources)

---

**Autor:** Rodrigo Gomes


