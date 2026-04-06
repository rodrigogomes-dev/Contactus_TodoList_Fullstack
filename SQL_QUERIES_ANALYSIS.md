# Análise de Queries SQL - Projeto TodoList Contactus

## 📊 Índice
- [TABELA users](#tabela-users)
- [TABELA tasks](#tabela-tasks)
- [TABELA categories](#tabela-categories)
- [TABELA badges](#tabela-badges)
- [TABELA badge_user](#tabela-badge_user)
- [TABELA personal_access_tokens](#tabela-personal_access_tokens)
- [Queries Avançadas](#queries-avançadas)

---

## TABELA users

### 📋 CREATE TABLE
**Localização:** `database/migrations/0001_01_01_000000_create_users_table.php`

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    avatar_path VARCHAR(255) NULL,           -- ADD (migration 2026_03_26)
    is_admin BOOLEAN DEFAULT FALSE,           -- ADD (migration 2026_03_26)
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEXES: email (UNIQUE), FULLTEXT search capable
)
```

**Colunas Adicionadas por Alterações:**
- `avatar_path` (migration: 2026_03_26_add_avatar_to_users.php)
- `is_admin` (migration: 2026_03_26_add_is_admin_to_users.php)

### 🔍 SELECTS Usadas

#### GET - Listar todos os users com ranking (UserController.php)
```php
// WITH eager loading e agregação
SELECT users.*, 
       COUNT(DISTINCT badges.id) as badges_count,
       COUNT(DISTINCT tasks.id) as tasks_completed
FROM users
LEFT JOIN badge_user ON users.id = badge_user.user_id
LEFT JOIN tasks ON users.id = tasks.user_id AND tasks.estado = 'concluída'
GROUP BY users.id
ORDER BY badges_count DESC
```

#### GET - Autentificação (AuthController.php)
```php
SELECT * FROM users WHERE email = ?
-- Com validação de password (bcrypt check na aplicação)
```

#### GET - Dados do utilizador autenticado (AuthController.php)
```php
SELECT users.* FROM users
WHERE users.id = ? (via $request->user())
-- Com eager load: tasks, badges
```

#### GET - Estatísticas de anos com utilizadores (StatsController.php)
```sql
SELECT DISTINCT YEAR(created_at) as year
FROM users
ORDER BY year DESC
```

#### GET - Meses com dados de utilizadores (StatsController.php)
```sql
SELECT DISTINCT MONTH(created_at) as month
FROM users
WHERE YEAR(created_at) = ?
ORDER BY month ASC
```

### ➕ INSERTS Usadas

#### CREATE - Registo novo (AuthController.php)
```php
INSERT INTO users (name, email, password, created_at, updated_at)
VALUES (?, ?, ?, NOW(), NOW())

// Dados:
- email: string (validated, unique)
- password: bcrypt hash
- name: string (default = email)
- is_admin: boolean (default = FALSE)
- avatar_path: NULL (pode ser upload depois)
```

#### CREATE - Factory de teste (UserSeeder.php)
```php
INSERT INTO users (name, email, password, is_admin, created_at, updated_at)
VALUES 
    ('Test Admin', 'testadmin@example.com', hash(password123), 1, NOW(), NOW()),
    ('Test User', 'testuser@example.com', hash(password123), 0, NOW(), NOW()),
    -- + 5 users aleatórios via Factory
```

### 🔄 UPDATES Usadas

#### UPDATE - Upload de avatar (UserController.php)
```sql
UPDATE users SET avatar_path = ?, updated_at = ? WHERE id = ?
-- avatar_path: string/path (ex: 'avatars/xyz.jpg')
```

#### UPDATE - Atualizar perfil (AuthController.php)
```php
// Via UpdateProfileRequest (validação no formulário)
UPDATE users SET name = ?, email = ?, updated_at = ? WHERE id = ?
// Campos atualizáveis: name, email
// Verificação: email único (exceto ele próprio)
```

#### UPDATE - Apagar avatar antigo antes de novo (UserController.php)
```sql
UPDATE users SET avatar_path = NULL WHERE id = ?
-- Executado antes de: UPDATE users SET avatar_path = ? WHERE id = ?
```

### ❌ DELETES Usadas
**NENHUMA** - O projeto não tem soft/hard delete de utilizadores

### 🔗 RELATIONSHIPS (Eloquent)
```php
// User Model (app/Models/User.php)

public function tasks()
{
    return $this->hasMany(Task::class);
    // Query: SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NULL
}

public function badges()
{
    return $this->belongsToMany(Badge::class);
    // Query: SELECT badges.*, badge_user.created_at 
    //        FROM badges 
    //        JOIN badge_user ON badges.id = badge_user.badge_id 
    //        WHERE badge_user.user_id = ?
}

// HasApiTokens (Laravel Sanctum)
public function createToken($name) { ... }
// Query: INSERT INTO personal_access_tokens (...)
```

### 🔐 Security & Fillable
```php
#[Fillable(['name', 'email', 'password', 'avatar_path', 'is_admin'])]
#[Hidden(['password', 'remember_token'])]

// Casts
protected function casts(): array {
    return [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',  // Auto-hash on create/update
    ];
}

// Virtual Attribute
public function getAvatarUrlAttribute(): ?string {
    // Retorna: asset('storage/avatars/xyz.jpg') ou NULL
}
```

---

## TABELA tasks

### 📋 CREATE TABLE
**Localização:** `database/migrations/2026_03_23_121244_create_tasks_table.php`

```sql
CREATE TABLE tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    estado ENUM('pendente', 'concluída') DEFAULT 'pendente',
    prioridade ENUM('baixa', 'média', 'alta') DEFAULT 'média',
    data_vencimento DATE NULL,
    category_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    
    INDEXES: user_id, category_id (para filters comuns)
)
```

### 🔍 SELECTS Usadas

#### GET - Listar tasks do utilizador (TaskController.php)
```php
SELECT tasks.* 
FROM tasks
WHERE user_id = ? AND (category_id = ? OR user_id = ?)
-- Com eager load: user, category
-- Paginated: 15 per page
-- Security: Apenas do user autenticado
```

#### GET - Task específica (TaskController.php)
```php
SELECT tasks.* FROM tasks WHERE id = ? AND user_id = ?
-- Com eager load: user, category
-- Security check: task.user_id === auth()->user()->id
```

#### COUNT - Tasks concluídas por utilizador (UserController.php)
```sql
SELECT COUNT(*) as tasks_count
FROM tasks
WHERE user_id = ? AND estado = 'concluída'
-- Usado em rankings
```

#### COUNT - Total de tasks por categoria (CategoryController.php)
```sql
SELECT COUNT(*) as tasks_count
FROM tasks
WHERE category_id = ?
-- Via withCount('tasks') no Eloquent
```

### ➕ INSERTS Usadas

#### CREATE - Nova task (TaskController.php)
```php
INSERT INTO tasks (user_id, titulo, descricao, estado, prioridade, data_vencimento, category_id, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())

// StoreTaskRequest validação:
- titulo: required, string, max:255
- descricao: nullable, string
- estado: in:pendente,concluída
- prioridade: in:baixa,média,alta
- data_vencimento: nullable, date
- category_id: nullable, exists:categories,id

// Auto-set: user_id = auth()->user()->id
```

#### CREATE - Factory de teste (UserSeeder.php)
```php
INSERT INTO tasks (user_id, titulo, descricao, category_id, prioridade, estado, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
-- 3-5 tasks por user aleatório
-- Dados: fake()->sentence(), fake()->paragraph(), random category
```

### 🔄 UPDATES Usadas

#### UPDATE - Atualizar task (TaskController.php)
```php
UPDATE tasks SET titulo = ?, descricao = ?, estado = ?, prioridade = ?, data_vencimento = ?, category_id = ?, updated_at = ? 
WHERE id = ? AND user_id = ?

// UpdateTaskRequest validação (mesma que POST)
// Security check: task.user_id === auth()->user()->id
```

### ❌ DELETES Usadas

#### DELETE - Task (TaskController.php - Hard Delete)
```sql
DELETE FROM tasks WHERE id = ? AND user_id = ?
-- Hard delete (sem soft delete)
-- Security check: task.user_id === auth()->user()->id
-- ON DELETE CASCADE aplicado se user for apagado
```

### 🔗 RELATIONSHIPS (Eloquent)
```php
// Task Model (app/Models/Task.php)

public function user()
{
    return $this->belongsTo(User::class);
    // Query: SELECT users.* FROM users WHERE id = ?
}

public function category()
{
    return $this->belongsTo(Category::class);
    // Query: SELECT categories.* FROM categories WHERE id = ?
    // NULL allowed (on delete: set null)
}
```

### 🔐 Fillable & Casts
```php
protected $fillable = [
    'titulo', 'descricao', 'estado', 'prioridade', 
    'data_vencimento', 'user_id', 'category_id'
];

// Estados válidos: 'pendente' | 'concluída'
// Prioridades válidas: 'baixa' | 'média' | 'alta'
```

---

## TABELA categories

### 📋 CREATE TABLE
**Localização:** `database/migrations/2026_03_23_121204_create_categories_table.php`

```sql
CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cor VARCHAR(7) NOT NULL,  -- Formato: #3B82F6 (hex color)
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEXES: nome (pode ter UNIQUE)
)
```

### 🔍 SELECTS Usadas

#### GET - Listar categorias (CategoryController.php)
```php
SELECT categories.*,
       COUNT(DISTINCT badges.id) as badges_count,
       COUNT(DISTINCT tasks.id) as tasks_count
FROM categories
LEFT JOIN badges ON categories.id = badges.category_id
LEFT JOIN tasks ON categories.id = tasks.category_id
GROUP BY categories.id
-- Com eager load: badges
-- Paginated: 15 per page
```

#### GET - Categoria específica (CategoryController.php)
```php
SELECT categories.* FROM categories WHERE id = ?
-- Com eager load: badges
-- Com count: tasks
```

### ➕ INSERTS Usadas

#### CREATE - Nova categoria (CategoryController.php)
```php
INSERT INTO categories (nome, cor, created_at, updated_at)
VALUES (?, ?, NOW(), NOW())

// StoreCategoryRequest validação:
- nome: required, string, max:255
- cor: required, string, regex:/^#[0-9A-F]{6}$/i

// Trigger: CategoryObserver::created() dispara e cria 4 badges automáticas
```

#### CREATE - Factory de teste (CategorySeeder.php)
```php
INSERT INTO categories (nome, cor, created_at, updated_at)
VALUES 
    ('Informática', '#3B82F6', NOW(), NOW()),
    ('RH', '#EC4899', NOW(), NOW()),
    ('Marketing', '#8B5CF6', NOW(), NOW()),
    ('Vendas', '#10B981', NOW(), NOW()),
    ('Financeiro', '#F59E0B', NOW(), NOW()),
    ('Administração', '#6B7280', NOW(), NOW()),
    ('Logística', '#EF4444', NOW(), NOW())
-- + Observer cria 4 badges para cada categoria
```

### 🔄 UPDATES Usadas

#### UPDATE - Editar categoria (CategoryController.php)
```php
UPDATE categories SET nome = ?, cor = ?, updated_at = ? WHERE id = ?

// UpdateCategoryRequest validação (mesma que POST)
```

### ❌ DELETES Usadas

#### DELETE - Categoria (CategoryController.php - Hard Delete)
```sql
DELETE FROM categories WHERE id = ?
-- Hard delete (sem soft delete)
-- Efeitos em cascata:
--   - badges.category_id SET NULL (foreign key onDelete='set null')
--   - tasks.category_id SET NULL (foreign key onDelete='set null')
```

### 🔗 RELATIONSHIPS (Eloquent)
```php
// Category Model (app/Models/Category.php)

public function tasks()
{
    return $this->hasMany(Task::class);
    // Query: SELECT tasks.* FROM tasks WHERE category_id = ?
}

public function badges()
{
    return $this->hasMany(Badge::class);
    // Query: SELECT badges.* FROM badges WHERE category_id = ?
}
```

### 🔐 Fillable & Observer
```php
protected $fillable = ['nome', 'cor'];

// CategoryObserver (app/Observers/CategoryObserver.php)
public function created(Category $category)
{
    // Cria 4 badges automáticas: iniciante, intermediário, avançado, especialista
    // Para cada (category_id, milestone) pair
}
```

---

## TABELA badges

### 📋 CREATE TABLE
**Localização:** `database/migrations/2026_03_23_153852_create_badges_table.php`

**Alterações:**
- `category_id` (migration: 2026_03_24_094307_add_category_id_to_badges.php)
- `icon` (migration: 2026_03_24_145717_add_icon_to_badges.php)
- `milestone` (migration: 2026_03_26_add_milestone_to_badges.php)

```sql
CREATE TABLE badges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    icon VARCHAR(255) NULL,                   -- ADD (migration 2026_03_24)
    category_id BIGINT UNSIGNED NULL,         -- ADD (migration 2026_03_24)
    milestone VARCHAR(50) NULL,               -- ADD (migration 2026_03_26)
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    UNIQUE KEY (nome, category_id, milestone)  -- Deduplication
)
```

### 🔍 SELECTS Usadas

#### GET - Listar badges (BadgeController.php)
```php
SELECT badges.* FROM badges
-- Com eager load: category
-- Paginated: 15 per page
```

#### GET - Badge específico (BadgeController.php)
```php
SELECT badges.* FROM badges WHERE id = ?
-- Com eager load: category
```

#### GET - Badges do utilizador (AuthController.php)
```php
SELECT badges.* FROM badges
JOIN badge_user ON badges.id = badge_user.badge_id
WHERE badge_user.user_id = ?
-- Com eager load: category
```

#### COUNT - Total de users com badge (Badge Model - percentage)
```sql
SELECT COUNT(DISTINCT badge_user.user_id) as count
FROM badge_user
WHERE badge_user.badge_id = ?

SELECT COUNT(*) as total FROM users
-- Calcula: (count / total) * 100
```

#### STATS - Badges por milestone (CategoryObserver)
```sql
SELECT badges.* FROM badges
WHERE category_id = ? AND milestone IN ('iniciante', 'intermediário', 'avançado', 'especialista')
```

### ➕ INSERTS Usadas

#### CREATE - Badge novo (BadgeController.php)
```php
INSERT INTO badges (nome, descricao, icon, category_id, milestone, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, NOW(), NOW())

// Validação:
- nome: required, string, max:255, unique
- descricao: nullable, string
- icon: nullable, string
- category_id: required, exists:categories,id
- milestone: implícito (não via API, mas via seeder)
```

#### CREATE - Badges globais (BadgeSeeder.php)
```php
INSERT INTO badges (nome, descricao, icon, category_id, milestone, created_at, updated_at)
VALUES 
    ('Iniciante', 'Conclua sua primeira tarefa...', 'badge-iniciante', NULL, 'iniciante', NOW(), NOW()),
    ('Intermediário', 'Conclua 10 tarefas...', 'badge-intermediario', NULL, 'intermediário', NOW(), NOW()),
    ('Avançado', 'Conclua 50 tarefas...', 'badge-avancado', NULL, 'avançado', NOW(), NOW()),
    ('Especialista', 'Conclua 100 tarefas...', 'badge-especialista', NULL, 'especialista', NOW(), NOW())

-- Usa firstOrCreate para idempotência
-- WHERE (nome, category_id, milestone)
```

#### CREATE - Badges por categoria (CategoryObserver.php)
```php
INSERT INTO badges (nome, descricao, icon, category_id, milestone, created_at, updated_at)
VALUES 
    ('Iniciante em [CATEGORIA]', '[N] tarefa(s)...', 'slug-iniciante', ?, 'iniciante', NOW(), NOW()),
    ('Intermediário em [CATEGORIA]', '[N] tarefa(s)...', 'slug-intermediário', ?, 'intermediário', NOW(), NOW()),
    ('Avançado em [CATEGORIA]', '[N] tarefa(s)...', 'slug-avançado', ?, 'avançado', NOW(), NOW()),
    ('Especialista em [CATEGORIA]', '[N] tarefa(s)...', 'slug-especialista', ?, 'especialista', NOW(), NOW())

-- Automaticamente quando Category::create()
-- Usa firstOrCreate para segurança em múltiplas migrações (fix_badge_deduplication)
```

### 🔄 UPDATES Usadas

#### UPDATE - Editar badge (BadgeController.php)
```php
UPDATE badges SET nome = ?, descricao = ?, icon = ?, category_id = ?, updated_at = ? 
WHERE id = ?

// Validação:
- nome: required, string, max:255, unique (exceto ele próprio)
- descricao: nullable, string
- icon: nullable, string
- category_id: required, exists:categories,id
```

### ❌ DELETES Usadas

#### DELETE - Badge (BadgeController.php - Hard Delete)
```sql
DELETE FROM badges WHERE id = ?
-- Hard delete (sem soft delete)
-- Efeitos em cascata:
--   - badge_user.badge_id CASCADE DELETE (foreign key)
```

### 🔗 RELATIONSHIPS (Eloquent)
```php
// Badge Model (app/Models/Badge.php)

public function category()
{
    return $this->belongsTo(Category::class);
    // Query: SELECT categories.* FROM categories WHERE id = ?
}

public function users()
{
    return $this->belongsToMany(User::class);
    // Query: SELECT users.*, badge_user.created_at 
    //        FROM users 
    //        JOIN badge_user ON users.id = badge_user.user_id 
    //        WHERE badge_user.badge_id = ?
}
```

### 🔐 Fillable, Casts & Virtual Attributes
```php
protected $fillable = ['nome', 'descricao', 'icon', 'category_id', 'milestone'];
protected $with = ['category'];  -- Eager load automático
protected $appends = ['icon_url', 'percentage'];

// Virtual Attributes (computed, não no DB)
public function getIconUrlAttribute(): string {
    // Retorna: https://api.iconify.design/{icon}.svg?color=%23{color}&width=128&height=128
    // Cor extraída da categoria
}

public function getPercentageAttribute(): float {
    // Calcula: (COUNT users com badge / COUNT total users) * 100
}
```

---

## TABELA badge_user

### 📋 CREATE TABLE
**Localização:** `database/migrations/2026_03_23_153912_create_badge_user_table.php`

```sql
CREATE TABLE badge_user (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    badge_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
    
    UNIQUE KEY (user_id, badge_id),  -- Cada user tem cada badge max 1x
    INDEXES: user_id, badge_id (para queries rápidas)
)
```

### 🔍 SELECTS Usadas

#### GET - Badges de um user (User::badges())
```sql
SELECT badges.*, badge_user.created_at 
FROM badges
JOIN badge_user ON badges.id = badge_user.badge_id
WHERE badge_user.user_id = ?
```

#### GET - Users com badge (Badge::users())
```sql
SELECT users.*, badge_user.created_at 
FROM users
JOIN badge_user ON users.id = badge_user.user_id
WHERE badge_user.badge_id = ?
```

#### COUNT - Total de badges por user (UserController.php)
```sql
SELECT COUNT(DISTINCT badge_user.badge_id) as badges_count
FROM badge_user
WHERE badge_user.user_id = ?
-- Usado em rankings
```

### ➕ INSERTS Usadas

#### CREATE - Atribuir badge a user (UserSeeder.php)
```php
INSERT INTO badge_user (user_id, badge_id, created_at, updated_at)
VALUES (?, ?, NOW(), NOW())

// Via: $user->badges()->attach($badgeIds)
// Método: attach() insere múltiplas relações
// Exemplo: $user->badges()->attach([1, 2, 3])
```

#### CREATE - Automático (TaskObserver)
```php
// Quando task estado = 'concluída':
// 1. Calcula total_completed_tasks_in_category
// 2. Verifica milestones atingidos (1, 10, 50, 100)
// 3. INSERT INTO badge_user se badge não existe ainda
// Usa firstOrCreate: INSERT ... ON DUPLICATE KEY UPDATE (ou similar)
```

### 🔄 UPDATES Usadas
**NENHUMA** - Tabela de pivot apenas para criar/apagar relacionamentos

### ❌ DELETES Usadas

#### DELETE - Remover badge de user
```sql
DELETE FROM badge_user WHERE user_id = ? AND badge_id = ?
-- Hard delete (sem soft delete)
-- Via: $user->badges()->detach($badgeId)
```

#### DELETE - Cascata ON DELETE
```sql
DELETE FROM badge_user WHERE user_id = ?  -- Quando user apagado
DELETE FROM badge_user WHERE badge_id = ?  -- Quando badge apagado
```

### 🔗 RELATIONSHIPS (Eloquent - Many-to-Many)
```php
// User Model
public function badges()
{
    return $this->belongsToMany(Badge::class);
}

// Badge Model
public function users()
{
    return $this->belongsToMany(User::class);
}

// Métodos disponíveis:
$user->badges();              // Query Builder
$user->badges()->get();       // Array de Badges
$user->badges()->attach($id); // INSERT
$user->badges()->detach($id); // DELETE
$user->badges()->sync($ids);  // UPDATE
```

---

## TABELA personal_access_tokens

### 📋 CREATE TABLE
**Localização:** `database/migrations/2026_03_25_143419_create_personal_access_tokens_table.php`

```sql
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,     -- Polymorphic: 'App\Models\User'
    tokenable_id BIGINT UNSIGNED NOT NULL,    -- user_id
    name TEXT NOT NULL,                        -- 'auth_token'
    token VARCHAR(64) NOT NULL UNIQUE,        -- bcrypt hash
    abilities TEXT NULL,                      -- JSON: '*' ou specific scopes
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEXES: 
    - (tokenable_type, tokenable_id)  -- Polymorphic
    - token (UNIQUE)
    - expires_at (para limpeza)
)
```

### 🔍 SELECTS Usadas

#### GET - Token atual do user (Sanctum Middleware)
```sql
SELECT personal_access_tokens.* 
FROM personal_access_tokens
WHERE token = ? AND tokenable_type = 'App\Models\User'
-- Via bearer token no header: Authorization: Bearer {token}
```

#### GET - Token atual (delete ao fazer logout)
```php
$request->user()->currentAccessToken()
// Retorna: personal_access_tokens record do token autenticado
```

### ➕ INSERTS Usadas

#### CREATE - Novo token (AuthController.php)
```php
INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at)
VALUES ('App\Models\User', ?, 'auth_token', ?, '*', NOW(), NOW())

// Via: $user->createToken('auth_token')->plainTextToken
// Sanitum.

// Execução:
// 1. Gera token aleatório
// 2. Cria hash do token (bcrypt)
// 3. Retorna plainTextToken (para resposta ao cliente)
// 4. Guarda hash na DB
```

#### CREATE - Login (AuthController.php)
```php
// LOGIN:
$user = User::where('email', ?)->first()
if (Hash::check($password, $user->password)) {
    $token = $user->createToken('auth_token')->plainTextToken
    // INSERT INTO personal_access_tokens ...
}
```

#### CREATE - Registo (AuthController.php)
```php
// REGISTER:
$user = User::create([...])
$token = $user->createToken('auth_token')->plainTextToken
// INSERT INTO personal_access_tokens ...
```

### 🔄 UPDATES Usadas
**NENHUMA** - Tokens não são atualizados (apenas criados e apagados)

### ❌ DELETES Usadas

#### DELETE - Logout (AuthController.php)
```php
DELETE FROM personal_access_tokens 
WHERE id = ? AND tokenable_id = ? AND tokenable_type = 'App\Models\User'

// Via: $request->user()->currentAccessToken()->delete()
// Obtém token da requisição e apaga
```

### 🔐 Polymorphic Relationship (Laravel Sanctum)
```php
// User Model tem:
use Laravel\Sanctum\HasApiTokens;

// Métodos:
$user->createToken($name)       // Retorna: NewAccessToken (tem plainTextToken)
$user->tokens()                 // Retorna: HasMany (todos os tokens do user)
$request->user()                // Carrega from token no DB
$request->user()->currentAccessToken()  // O token usado nesta request
```

---

## 🚀 Queries Avançadas

### 1️⃣ GROWTH ANALYTICS (StatsController.php)

#### Crescimento de Users por Mês
```sql
SELECT 
    MONTH(created_at) as month,
    COUNT(*) as count
FROM users
WHERE YEAR(created_at) = ? 
  AND MONTH(created_at) <= MONTH(NOW())
GROUP BY MONTH(created_at)
ORDER BY month ASC
```

**Lógica:**
- Filtrar por ano específico
- Limitar a mês atual (não mostrar futuro)
- Agrupar por mês
- Retornar count de users criados nesse mês

### 2️⃣ RANKINGS (UserController.php)

#### Rankings com Badges e Tasks Completas
```sql
SELECT 
    users.id,
    users.name,
    users.avatar_url,
    COUNT(DISTINCT badge_user.badge_id) as badges_count,
    COUNT(DISTINCT CASE WHEN tasks.estado = 'concluída' THEN tasks.id END) as tasks_completed
FROM users
LEFT JOIN badge_user ON users.id = badge_user.user_id
LEFT JOIN tasks ON users.id = tasks.user_id
GROUP BY users.id
ORDER BY badges_count DESC, tasks_completed DESC
```

**Lógica:**
- LEFT JOIN para incluir users sem badges/tasks
- COUNT(DISTINCT ...) para evitar duplicação
- CASE WHEN para filtrar apenas tasks 'concluída'
- ORDER BY badges_count DESC (primary) depois tasks_completed

### 3️⃣ GAMIFICATION TRIGGERS (TaskObserver)

#### Quando Task completa (TaskObserver::created/updated)
```php
// Pseudocode do fluxo:

if ($task->estado === 'concluída' && $oldState !== 'concluída') {
    // 1. Contar tasks concluídas na categoria
    $count = Task::where('user_id', $task->user_id)
                  ->where('category_id', $task->category_id)
                  ->where('estado', 'concluída')
                  ->count()
    
    // 2. Verificar milestones (1, 10, 50, 100)
    $milestones = [
        1 => 'iniciante',
        10 => 'intermediário', 
        50 => 'avançado',
        100 => 'especialista'
    ]
    
    foreach ($milestones as $threshold => $milestone) {
        if ($count >= $threshold) {
            // 3. Procurar badge
            $badge = Badge::where('category_id', $task->category_id)
                          ->where('milestone', $milestone)
                          ->first()
            
            // 4. Atribuir badge (se não houver)
            $user->badges()->attach($badge->id)  // INSERT IGNORE
        }
    }
}
```

**Queries geradas:**
```sql
-- Contar tasks concluídas
SELECT COUNT(*) FROM tasks 
WHERE user_id = ? AND category_id = ? AND estado = 'concluída'

-- Procurar badge
SELECT badges.* FROM badges 
WHERE category_id = ? AND milestone = ?

-- Atribuir badge
INSERT INTO badge_user (user_id, badge_id, created_at, updated_at) 
VALUES (?, ?, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW()
```

### 4️⃣ CATEGORY BADGES AUTO-CREATION (CategoryObserver)

#### Quando Category criada (CategoryObserver::created)
```php
// Pseudocode:

public function created(Category $category) {
    $milestones = [
        'iniciante' => 1,
        'intermediário' => 10,
        'avançado' => 50,
        'especialista' => 100
    ]
    
    foreach ($milestones as $milestone => $threshold) {
        Badge::firstOrCreate(
            [
                'nome' => "{milestone} em {category.nome}",
                'category_id' => $category->id,
                'milestone' => $milestone
            ],
            [
                'descricao' => "{threshold} tarefa(s)...",
                'icon' => "{slug}-{milestone}"
            ]
        )
    }
}
```

**Queries geradas:**
```sql
-- Para cada milestone (4x)
SELECT * FROM badges 
WHERE nome = ? AND category_id = ? AND milestone = ?

-- Se não existe, INSERT:
INSERT INTO badges (nome, descricao, icon, category_id, milestone, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, NOW(), NOW())
```

---

## 📊 RESUMO DE INDEXES

### Index por Tabela
| Tabela | Coluna | Tipo | Uso |
|--------|--------|------|-----|
| users | email | UNIQUE | Auth login |
| users | id | PRIMARY | Relations |
| tasks | user_id | FOREIGN | Filter by user |
| tasks | category_id | FOREIGN | Filter by category |
| categories | id | PRIMARY | Relations |
| badges | id | PRIMARY | Relations |
| badges | category_id | FOREIGN | Filter by category |
| badges | (nome, category_id, milestone) | UNIQUE | Deduplication |
| badge_user | (user_id, badge_id) | UNIQUE | Many-to-many |
| badge_user | user_id | FOREIGN | Filter by user |
| badge_user | badge_id | FOREIGN | Filter by badge |
| personal_access_tokens | token | UNIQUE | Auth token lookup |
| personal_access_tokens | (tokenable_type, tokenable_id) | INDEX | Polymorphic |
| personal_access_tokens | expires_at | INDEX | Token cleanup |

---

## 🔄 FLUXOS PRINCIPAIS

### Fluxo: Registo de User
```
POST /api/register
  ↓
AuthController::register()
  ↓
User::create([email, password (hashed), name])
  ↓
INSERT INTO users (...)
  ↓
$user->createToken('auth_token')
  ↓
INSERT INTO personal_access_tokens (...)
  ↓
Response: { user, token }
```

### Fluxo: Login
```
POST /api/login
  ↓
AuthController::login()
  ↓
User::where('email', ...)->first()
  ↓
SELECT * FROM users WHERE email = ?
  ↓
Hash::check(password)
  ↓
$user->createToken('auth_token')
  ↓
INSERT INTO personal_access_tokens (...)
  ↓
Response: { user, token }
```

### Fluxo: Criar Task
```
POST /api/tasks
  ↓
TaskController::store()
  ↓
Task::create([titulo, descricao, ...])
  ↓
INSERT INTO tasks (user_id, ..., created_at, updated_at)
  ↓
Return: TaskResource
```

### Fluxo: Completar Task (Gamification)
```
PUT /api/tasks/{id}
  ↓
TaskController::update(estado = 'concluída')
  ↓
Task::update([estado = 'concluída'])
  ↓
UPDATE tasks SET estado = 'concluída' WHERE id = ?
  ↓
TaskObserver::updated() trigger
  ↓
SELECT COUNT(*) FROM tasks 
  WHERE user_id = ? AND category_id = ? AND estado = 'concluída'
  ↓
Compare with milestones [1, 10, 50, 100]
  ↓
IF count >= threshold:
    SELECT badges WHERE category_id = ? AND milestone = ?
    ↓
    INSERT INTO badge_user IF NOT EXISTS
  ↓
Return: TaskResource com badge info (via API response)
```

### Fluxo: Criar Categoria
```
POST /api/categories
  ↓
CategoryController::store()
  ↓
Category::create([nome, cor])
  ↓
INSERT INTO categories (...)
  ↓
CategoryObserver::created() trigger
  ↓
FOR EACH milestone [iniciante, intermediário, avançado, especialista]:
    Badge::firstOrCreate([
        nome = "{milestone} em {nome}",
        category_id = ?,
        milestone = ?
    ])
    ↓
    SELECT badges WHERE nome = ? AND category_id = ? AND milestone = ?
    IF NOT EXISTS:
        INSERT INTO badges (...)
  ↓
Return: CategoryResource
```

---

## 🛡️ SEGURANÇA IMPLEMENTADA

### Authentication
- ✅ Sanctum tokens (bearer token no header)
- ✅ Password hashing (bcrypt via `casts`)
- ✅ Token expiry (expires_at column)

### Authorization
- ✅ User can only access own tasks (TaskController)
- ✅ User can only update own profile
- ✅ Admin flag in users table para future RBAC

### Input Validation
- ✅ All create/update endpoints via FormRequest
- ✅ Email unique validation
- ✅ Enum validation (estado, prioridade)
- ✅ Hex color validation (categories)

### SQL Injection Prevention
- ✅ Eloquent ORM (parameterized queries)
- ✅ No raw SQL executado via user input
- ✅ Binding via placeholders (?)

---

## 📝 NOTAS IMPORTANTES

1. **Soft Deletes**: Não implementado. Usa hard delete em todas as tabelas.

2. **Timestamps**: Todas as tabelas têm `created_at` e `updated_at`.

3. **Cascading Deletes**:
   - `tasks.onDelete('cascade')` → Apagar user apaga suas tasks
   - `badge_user.onDelete('cascade')` → Apagar user/badge apaga relacionamentos
   - `tasks.category_id.onDelete('set null')` → Apagar categoria nulifica tasks

4. **Observer Triggers**:
   - `CategoryObserver::created()` → Cria 4 badges automáticas
   - `TaskObserver::updated()` → Atribui badges por milestone

5. **Polymorphic Foreign Key**:
   - `personal_access_tokens` usa `tokenable_type` + `tokenable_id`
   - Permite múltiplos modelos (User, etc.) terem tokens

6. **Many-to-Many**:
   - `User ↔ Badge` via tabela pivot `badge_user`
   - Com timestamps (para saber quando badge foi ganho)

7. **Idempotência**:
   - `Badge` usa `firstOrCreate()` para evitar duplicatas
   - Importante em seeders para rodar múltiplas vezes

---

**Gerado em:** 2026-04-06
**Versão:** Laravel 11 com Sanctum Authentication
