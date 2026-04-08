# TODO List - Contactus Full Stack

**Plataforma de Gestão de Tarefas com Gamificação**

Autor: **Rodrigo Gomes**

---

## Visão Geral

Aplicação completa de gestão de tarefas com sistema de gamificação baseado em badges. Desenvolvida com **Laravel 11** (Backend) e **Angular 21** (Frontend) com autenticação via tokens Sanctum e MySQL 8.0+.

### Funcionalidades Principais

- **Autenticação** - Login/Registo com tokens Bearer (Sanctum)
- **Gestão de Tarefas** - CRUD completo com estados e prioridades
- **Categorias** - Organização de tarefas por categoria
- **Gamificação** - Sistema automático de badges baseado em milestones
- **Avatar de Utilizador** - Upload e visualização de fotografias
- **Rankings** - Leaderboard de utilizadores por badges e tarefas concluídas
- **Estatísticas** - Dashboard admin com gráficos de crescimento

---

## Arquitetura

### Stack Tecnológico

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Backend API | Laravel | 11 |
| Frontend SPA | Angular | 21 |
| Database | MySQL | 8.0+ |
| Auth | Sanctum | Tokens Bearer |
| Charts | Chart.js | 4.5+ |

### Estrutura de Pastas

```
Projeto_TodoList_Contactus_Fullstack/
├── backend/              # Laravel API
│   ├── app/
│   ├── routes/api.php
│   ├── database/
│   └── ...
├── frontend/             # Angular SPA
│   ├── frontend/         # Workspace Angular
│   │   ├── app/
│   │   ├── main.ts
│   │   └── ...
│   ├── QUICK_START_FRONTEND.md
│   └── ...
├── README.md             # Este ficheiro
├── QUICK_START_BACKEND.md
├── .gitignore
└── ...
```

---

## Quick Start

### Pré-Requisitos

- **PHP 8.2+** com extensões: mysql, xml, dom
- **Node.js 18+** com npm
- **MySQL 8.0+**
- **Composer**
- **Angular CLI 21+** (opcional, usamos npx ng)

### Setup Backend (2 minutos)

```bash
cd backend

# 1. Instalar dependências PHP
composer install

# 2. Configurar ambiente
cp .env.example .env
php artisan key:generate

# 3. Criar base de dados
mysql -u root -p -e "CREATE DATABASE db_todolist_contactus;"

# 4. Carregar schema e dados
php artisan migrate:fresh --seed

# 5. Criar symlink de storage para avatares
php artisan storage:link

# 6. Iniciar servidor (porta 8000)
php artisan serve
```

**Documentação Completa:** [QUICK_START_BACKEND.md](./QUICK_START_BACKEND.md)

### Setup Frontend (2 minutos)

```bash
cd frontend/frontend

# 1. Instalar dependências
npm install

# 2. Iniciar servidor (porta 4200)
ng serve

# 3. Abrir browser
# http://localhost:4200
```

**Documentação Completa:** [QUICK_START_FRONTEND.md](./frontend/QUICK_START_FRONTEND.md)

---

## Database Schema

### 7 Tabelas Principais

| Tabela | Propósito | Registos |
|--------|-----------|----------|
| **users** | Utilizadores da plataforma | 8 |
| **tasks** | Tarefas individuais | 21 |
| **categories** | Categorias de tarefas | 8 |
| **badges** | Badges de gamificação | 36 |
| **badge_user** | Relação N-N users ↔ badges | 18 |
| **personal_access_tokens** | Tokens Sanctum | 20 |
| **migrations** | Histórico de migrations | 14 |

### Relacionamentos

```
users
├── hasMany: tasks
└── belongsToMany: badges (via badge_user)

tasks
├── belongsTo: users
└── belongsTo: categories (nullable)

categories
├── hasMany: tasks
└── hasMany: badges

badges
├── belongsTo: categories (nullable)
└── belongsToMany: users (via badge_user)
```

---

## Autenticação

### Credenciais de Teste

- **Email:** `testadmin@example.com`
- **Password:** `password123`

### Fluxo de Autenticação

1. `POST /api/login` → Retorna token Bearer
2. Token armazenado em `localStorage.auth_token`
3. Interceptador Angular anexa token em todos os requests
4. Backend valida via middleware `auth:sanctum`
5. `POST /api/logout` → Elimina token

---

## Sistema de Gamificação

### Milestones & Badges

Quando um utilizador conclui tarefas numa categoria, automaticamente recebe badges:

| Milestone | Tarefas | Badge |
|-----------|---------|-------|
| 1 | 1 concluída | Iniciante em [Categoria] |
| 10 | 10 concluídas | Intermédio em [Categoria] |
| 50 | 50 concluídas | Avançado em [Categoria] |
| 100 | 100 concluídas | Especialista em [Categoria] |

### Automação

- **TaskObserver** dispara ao atualizar task
- **CategoryObserver** cria 4 badges automaticamente ao criar categoria
- Atribuição de badges é instantânea (sem delay)

---

## API Endpoints

### Públicos (sem autenticação)

```
POST   /api/login              Login
POST   /api/register           Registar
GET    /api/rankings           Leaderboard global
```

### Autenticados (requerem token)

```
# Utilizador
GET    /api/me                 Dados do utilizador
PATCH  /api/me                 Atualizar perfil
POST   /api/users/avatar       Upload avatar
GET    /api/me/badges          My badges

# Tasks
GET    /api/tasks              Listar tarefas
POST   /api/tasks              Criar tarefa
GET    /api/tasks/{id}         Ver tarefa
PUT    /api/tasks/{id}         Editar tarefa
DELETE /api/tasks/{id}         Eliminar tarefa

# Categories
GET    /api/categories         Listar categorias
POST   /api/categories         Criar categoria
PUT    /api/categories/{id}    Editar categoria
DELETE /api/categories/{id}    Eliminar categoria

# Badges
GET    /api/badges             Listar badges

# Admin
GET    /api/admin/stats        Estatísticas globais
GET    /api/stats/available-years-months
GET    /api/stats/users-growth?period=year&year=2026
```

---

## Troubleshooting

### Backend não responde

```bash
# Verificar se PHP está a correr
ps aux | grep "php artisan serve"

# Verificar porta 8000
lsof -i :8000

# Reiniciar com output
php artisan serve --host=127.0.0.1 --port=8000
```

### Frontend não carrega

```bash
# Verificar se Node está a correr
ps aux | grep "ng serve"

# Limpar cache Angular
rm -rf frontend/frontend/.angular

# Reinstalar dependências
cd frontend/frontend
npm ci
ng serve
```

### CORS errors

**Já configurado!** 
- Middleware `HandleCors.php` permite `http://localhost:4200`
- Rota OPTIONS para preflight requests

### Avatar não aparece

1. Verificar se `storage/app/public/avatars/` existe
2. Confirmar symlink: `php artisan storage:link`
3. Testar upload via `POST /api/users/avatar`

---

## Documentação Adicional

- [QUICK_START_BACKEND.md](./QUICK_START_BACKEND.md) - Setup detalhado do Laravel
- [QUICK_START_FRONTEND.md](./frontend/QUICK_START_FRONTEND.md) - Setup detalhado do Angular
- [Relevant_Querys.txt](./frontend/Docs/Relevant_Querys.txt) - Queries SQL importantes

---


## Features Implementados

- Autenticação com Sanctum
- ✅ CRUD de tarefas com filtros
- ✅ Sistema de categorias dinâmico
- ✅ Gamificação com milestones automáticos
- ✅ Upload de avatar com storage
- ✅ Rankings globais
- ✅ Dashboard admin com estatísticas
- ✅ Gestão de badges
- ✅ Soft/Hard deletes configurados
- ✅ CORS configurado
- ✅ Paginação em endpoints
- ✅ Validações cliente e servidor

---

## 🔄 Próximos Steps (Opcional)

- [ ] Export de estatísticas (PDF/CSV)
- [ ] Dark mode no frontend
- [ ] Testes unitários completos
- [ ] CI/CD pipeline

---

## 👨‍💻 Autor

**Rodrigo Gomes**

---

## 📄 Licença

Propriedade privada - Contactus

---

