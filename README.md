# TODO App - Backend Laravel

Aplicação de gestão de tarefas com sistema de gamificação baseado em badges, desenvolvida com Laravel 11 e MySQL.

## Visão Geral

Backend REST API para uma plataforma de gestão de tarefas com suporte a:
- Autenticação com tokens Sanctum
- CRUD de tarefas, categorias e badges
- Sistema de gamificação com milestones
- Painel administrativo para gestão
- Relacionamentos muitos-para-muitos (badges-users)

## Requisitos

- PHP 8.2+
- Composer
- MySQL 8.0+
- Laravel 11

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone <repository-url>
cd todo-laravel
composer install
```

Configure o ficheiro `.env`:

```bash
cp .env.example .env
php artisan key:generate
```

Execute as migrações:

```bash
php artisan migrate
php artisan seed
```

Inicie o servidor:

```bash
php artisan serve
```

O servidor estará disponível em `http://localhost:8000`

## Estrutura de Base de Dados

### Tabelas Principais

| Tabela | Funcionalidade |
|--------|---|
| users | Utilizadores da plataforma |
| tasks | Tarefas dos utilizadores |
| categories | Categorias de tarefas |
| badges | Badges de gamificação |
| badge_user | Relação muitos-para-muitos entre badges e utilizadores |

### Modelos

#### User
- Campos: id, name, email, password, is_admin, avatar_path
- Relações: hasMany(Task), belongsToMany(Badge)

#### Task
- Campos: id, titulo, descricao, estado, prioridade, data_vencimento, user_id, category_id
- Estados: pendente, concluída
- Prioridades: baixa, média, alta
- Relações: belongsTo(User), belongsTo(Category)

#### Category
- Campos: id, nome_categoria
- Relações: hasMany(Badge)

#### Badge
- Campos: id, nome, descricao, icon, category_id, milestone
- Milestones: iniciante, intermediário, avançado, especialista
- Relações: belongsToMany(User), belongsTo(Category)

## Autenticação

A API utiliza Laravel Sanctum para autenticação baseada em tokens.

### Registrar e Login

```
POST /api/register
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "password123"
}
```

```
POST /api/login
{
  "email": "joao@example.com",
  "password": "password123"
}
```

Resposta inclui um token Bearer para utilizar em requisições autenticadas.

## Endpoints da API

### Público

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/register | Registar novo utilizador |
| POST | /api/login | Fazer login |

### Autenticado

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/logout | Fazer logout e revogar token |
| GET | /api/me | Obter dados do utilizador autenticado |
| GET | /api/tasks | Listar tarefas do utilizador |
| GET | /api/tasks?user_id={id} | Filtrar tarefas por utilizador |
| GET | /api/tasks/{id} | Obter tarefa específica |
| POST | /api/tasks | Criar nova tarefa |
| PUT | /api/tasks/{id} | Atualizar tarefa |
| DELETE | /api/tasks/{id} | Deletar tarefa |
| GET | /api/categories | Listar categorias |
| GET | /api/categories/{id} | Obter categoria específica |
| GET | /api/badges | Listar badges com percentagem |
| GET | /api/badges/{id} | Obter badge específica |
| POST | /api/users/avatar | Upload de avatar |

### Administrativo

| Método | Endpoint | Descrição | Requisito |
|--------|----------|-----------|-----------|
| POST | /api/categories | Criar categoria | Admin |
| PUT | /api/categories/{id} | Atualizar categoria | Admin |
| DELETE | /api/categories/{id} | Deletar categoria | Admin |
| POST | /api/badges | Criar badge | Admin |
| PUT | /api/badges/{id} | Atualizar badge | Admin |
| DELETE | /api/badges/{id} | Deletar badge | Admin |
| GET | /api/admin/stats | Obter estatísticas | Admin |

## Gamificação

### Milestones Globais

Quando um utilizador conclui tarefas, recebe automaticamente badges de milestone:

- Iniciante: 1 tarefa concluída
- Intermediário: 10 tarefas concluídas
- Avançado: 50 tarefas concluídas
- Especialista: 100 tarefas concluídas

### Badges de Categoria

Ao criar uma categoria, são geradas automaticamente 5 badges:

- Badge principal da categoria (milestone: null)
- Iniciante em {categoria} (milestone: iniciante)
- Intermediário em {categoria} (milestone: intermediário)
- Avançado em {categoria} (milestone: avançado)
- Especialista em {categoria} (milestone: especialista)

### Percentagem de Badges

Cada badge inclui um campo `percentage` que indica que percentagem de utilizadores a possuem.

## Segurança

- Validação de proprietário em operações de tarefas (um utilizador só vê/modifica as suas tarefas)
- Middleware de autenticação Sanctum para rotas protegidas
- Middleware administrativo para rotas de admin
- Delete on cascade para integridade referencial
- Passwords encriptadas com bcrypt

## CORS

A API está configurada para aceitar pedidos de:
- localhost:3000
- localhost:4200
- localhost:8000

## Exemplo de Utilização

```javascript
// Login
const response = await fetch('http://localhost:8000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const { user, token } = await response.json();

// Criar tarefa
const taskResponse = await fetch('http://localhost:8000/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    titulo: 'Implementar feature X',
    descricao: 'Descrição detalhada',
    prioridade: 'alta',
    estado: 'pendente',
    data_vencimento: '2026-04-01',
    user_id: user.id,
    category_id: 1
  })
});
```

## Desenvolvimento

### Crear Observadores

O projeto inclui Observers para automatizar lógica de negócio:

- TaskObserver: Atribui badges ao completar tarefas
- CategoryObserver: Cria badges ao criar categorias

### Migrações

Para criar uma nova migração:

```bash
php artisan make:migration create_table_name
php artisan make:model ModelName -m
```

## Licença

MIT

## Autor

Desenvolvido como projeto de aprendizagem em Laravel.


## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
