# API Contracts - Exemplos JSON Reais

Documentação completa dos contratos de API com exemplos JSON autênticos, status HTTP e estruturas de erro.

**Data de documentação:** 2026-04-01  
**Versão API:** Laravel 11  
**Autenticação:** Sanctum Bearer Token

## 📋 Índice

1. [Auth (Autenticação)](#auth)
2. [Tasks (Tarefas)](#tasks)
3. [Categories (Categorias)](#categories)
4. [Badges](#badges)
5. [Stats (Admin)](#stats)
6. [Estruturas de Erro](#estruturas-de-erro)
7. [Padrões Globais](#padrões-globais)

---

## Auth

### POST /api/login

**Credenciais do teste:**
- Email: `testadmin@example.com`
- Password: `password123`

#### ✅ Success (200 OK)

```http
POST /api/login HTTP/1.1
Content-Type: application/json

{"email":"testadmin@example.com","password":"password123"}
```

**Resposta:**
```json
{
  "user": {
    "id": 8,
    "name": "Test Admin",
    "email": "testadmin@example.com",
    "avatar": null,
    "is_admin": 1,
    "created_at": "2026-04-01T10:14:01.000000Z",
    "updated_at": "2026-04-01T10:14:01.000000Z"
  },
  "token": "3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8Q4e0a7b8"
}
```

#### ❌ Error: Credenciais Inválidas (401)

```http
POST /api/login HTTP/1.1
Content-Type: application/json

{"email":"wrong@example.com","password":"wrong"}
```

**Resposta (401 Unauthorized):**
```json
{
  "message": "Credenciais inválidas"
}
```

#### ❌ Error: Validação (422)

```http
POST /api/login HTTP/1.1
Content-Type: application/json

{"email":"invalid-email","password":""}
```

**Resposta (422 Unprocessable Entity):**
```json
{
  "message": "The email field must be a valid email address. (and 1 more error)",
  "errors": {
    "email": [
      "The email field must be a valid email address."
    ],
    "password": [
      "The password field is required."
    ]
  }
}
```

---

### POST /api/register

#### ✅ Success (201 Created)

```http
POST /api/register HTTP/1.1
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "password123"
}
```

**Resposta:**
```json
{
  "user": {
    "id": 9,
    "name": "João Silva",
    "email": "joao@example.com",
    "avatar": null,
    "is_admin": 0,
    "created_at": "2026-04-01T10:15:00.000000Z",
    "updated_at": "2026-04-01T10:15:00.000000Z"
  },
  "token": "4|AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdef"
}
```

#### ❌ Error: Email já registado (422)

```http
POST /api/register HTTP/1.1
Content-Type: application/json

{
  "name": "Test Admin",
  "email": "testadmin@example.com",
  "password": "password123"
}
```

**Resposta (422 Unprocessable Entity):**
```json
{
  "message": "The email has already been taken.",
  "errors": {
    "email": [
      "The email has already been taken."
    ]
  }
}
```

---

### POST /api/logout

#### ✅ Success (200 OK)

```http
POST /api/logout HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

#### ❌ Error: Não autenticado (401)

```http
POST /api/logout HTTP/1.1
```

**Resposta (401 Unauthorized):**
```json
{
  "message": "Unauthenticated."
}
```

---

### GET /api/me

#### ✅ Success (200 OK)

```http
GET /api/me HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:**
```json
{
  "id": 8,
  "name": "Test Admin",
  "email": "testadmin@example.com",
  "avatar": null,
  "is_admin": 1,
  "created_at": "2026-04-01T10:14:01.000000Z",
  "updated_at": "2026-04-01T10:14:01.000000Z"
}
```

❓ **Pergunta:** Deve incluir badges do utilizador? 
**Resposta:** Atualmente NÃO inclui. Endpoint separado: `GET /api/badges` para badges

---

## Tasks

**Base URL:** `/api/tasks`  
**Autenticação:** ✅ Obrigatória  
**Filtro por utilizador:** Automático (users só vêem suas próprias tasks)

### GET /api/tasks (Sem filtros)

#### ✅ Success (200 OK)

```http
GET /api/tasks HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Implementar login",
      "descricao": "Endpoint /api/login com Sanctum",
      "estado": "concluída",
      "prioridade": "alta",
      "data_vencimento": "2026-04-05",
      "user_id": 8,
      "category_id": 2,
      "created_at": "2026-04-01T09:00:00.000000Z",
      "updated_at": "2026-04-01T10:00:00.000000Z"
    },
    {
      "id": 2,
      "titulo": "Criar dashboard",
      "descricao": null,
      "estado": "pendente",
      "prioridade": "média",
      "data_vencimento": "2026-04-15",
      "user_id": 8,
      "category_id": 3,
      "created_at": "2026-04-01T09:30:00.000000Z",
      "updated_at": "2026-04-01T09:30:00.000000Z"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/tasks?page=1",
    "last": "http://localhost:8000/api/tasks?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "links": [
      {
        "url": null,
        "label": "&laquo; Previous",
        "active": false
      },
      {
        "url": "http://localhost:8000/api/tasks?page=1",
        "label": "1",
        "active": true
      },
      {
        "url": null,
        "label": "Next &raquo;",
        "active": false
      }
    ],
    "path": "http://localhost:8000/api/tasks",
    "per_page": 15,
    "to": 2,
    "total": 2
  }
}
```

### GET /api/tasks?user_id=8

#### ✅ Success (200 OK)

```http
GET /api/tasks?user_id=8 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:** Mesma estrutura acima (paginada com `data`, `links`, `meta`)

---

### GET /api/tasks/{id}

#### ✅ Success (200 OK)

```http
GET /api/tasks/1 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:**
```json
{
  "id": 1,
  "titulo": "Implementar login",
  "descricao": "Endpoint /api/login com Sanctum",
  "estado": "concluída",
  "prioridade": "alta",
  "data_vencimento": "2026-04-05",
  "user_id": 8,
  "category_id": 2,
  "created_at": "2026-04-01T09:00:00.000000Z",
  "updated_at": "2026-04-01T10:00:00.000000Z"
}
```

#### ❌ Error: Tarefa não encontrada (404)

```http
GET /api/tasks/999 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta (404 Not Found):**
```json
{
  "message": "Tarefa não encontrada"
}
```

---

### POST /api/tasks

#### ✅ Success (201 Created)

```http
POST /api/tasks HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
Content-Type: application/json

{
  "titulo": "Nova tarefa",
  "descricao": "Descrição da tarefa",
  "estado": "pendente",
  "prioridade": "média",
  "data_vencimento": "2026-04-10",
  "category_id": 2
}
```

**Resposta:**
```json
{
  "id": 10,
  "titulo": "Nova tarefa",
  "descricao": "Descrição da tarefa",
  "estado": "pendente",
  "prioridade": "média",
  "data_vencimento": "2026-04-10",
  "user_id": 8,
  "category_id": 2,
  "created_at": "2026-04-01T10:20:00.000000Z",
  "updated_at": "2026-04-01T10:20:00.000000Z"
}
```

#### ❌ Error: Validação (422)

```http
POST /api/tasks HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
Content-Type: application/json

{
  "titulo": "",
  "estado": "invalid_status",
  "prioridade": "invalid_priority"
}
```

**Resposta (422 Unprocessable Entity):**
```json
{
  "message": "The titulo field is required. (and 2 more errors)",
  "errors": {
    "titulo": [
      "The titulo field is required."
    ],
    "estado": [
      "The estado field must be one of: pendente, concluída."
    ],
    "prioridade": [
      "The prioridade field must be one of: baixa, média, alta."
    ]
  }
}
```

❓ **Quando é retornado meta/new_badges?**  
**Resposta:** Atualmente NÃO retorna. Seria bom adicionar no update quando tarefa é marcada como concluída.

---

### PUT /api/tasks/{id}

#### ✅ Success (200 OK)

```http
PUT /api/tasks/1 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
Content-Type: application/json

{
  "titulo": "Implementar autenticação",
  "estado": "concluída",
  "prioridade": "alta"
}
```

**Resposta:**
```json
{
  "id": 1,
  "titulo": "Implementar autenticação",
  "descricao": "Endpoint /api/login com Sanctum",
  "estado": "concluída",
  "prioridade": "alta",
  "data_vencimento": "2026-04-05",
  "user_id": 8,
  "category_id": 2,
  "created_at": "2026-04-01T09:00:00.000000Z",
  "updated_at": "2026-04-01T10:25:00.000000Z"
}
```

#### ❌ Error: Não autorizado (403)

Se tentar editar tarefa de outro utilizador:

```http
PUT /api/tasks/999 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
Content-Type: application/json

{"titulo": "Hack attempt"}
```

**Resposta (403 Forbidden):**
```json
{
  "message": "This action is unauthorized."
}
```

---

### DELETE /api/tasks/{id}

#### ✅ Success (204 No Content)

```http
DELETE /api/tasks/10 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:** Vazio (apenas status 204)

#### ❌ Error: Não autorizado (403)

```http
DELETE /api/tasks/999 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta (403 Forbidden):**
```json
{
  "message": "This action is unauthorized."
}
```

---

## Categories

**Base URL:** `/api/categories`  
**Autenticação:** ✅ Obrigatória (POST/PUT/DELETE requerem admin)

### GET /api/categories

#### ✅ Success (200 OK)

```http
GET /api/categories HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Trabalho",
      "cor": "#FF5733",
      "created_at": "2026-03-25T10:00:00.000000Z",
      "updated_at": "2026-03-25T10:00:00.000000Z"
    },
    {
      "id": 2,
      "nome": "Personal",
      "cor": "#33A1FF",
      "created_at": "2026-03-25T10:05:00.000000Z",
      "updated_at": "2026-03-25T10:05:00.000000Z"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/categories?page=1",
    "last": "http://localhost:8000/api/categories?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "per_page": 15,
    "to": 2,
    "total": 2
  }
}
```

---

### POST /api/categories

#### ✅ Success (201 Created)

```http
POST /api/categories HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
Content-Type: application/json

{
  "nome": "Estudo",
  "cor": "#FFD700"
}
```

**Resposta:**
```json
{
  "id": 8,
  "nome": "Estudo",
  "cor": "#FFD700",
  "created_at": "2026-04-01T10:30:00.000000Z",
  "updated_at": "2026-04-01T10:30:00.000000Z"
}
```

#### ❌ Error: Não é admin (403)

```http
POST /api/categories HTTP/1.1
Authorization: Bearer 4|AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
Content-Type: application/json

{"nome": "Test", "cor": "#123456"}
```

**Resposta (403 Forbidden):**
```json
{
  "message": "Apenas administradores podem aceder a este recurso"
}
```

#### ❌ Error: Validação (422)

```http
POST /api/categories HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
Content-Type: application/json

{"nome": "", "cor": "invalid"}
```

**Resposta (422 Unprocessable Entity):**
```json
{
  "message": "The nome field is required. (and 1 more error)",
  "errors": {
    "nome": [
      "The nome field is required."
    ],
    "cor": [
      "The cor field must be a valid hex color (format: #RRGGBB)."
    ]
  }
}
```

---

### PUT /api/categories/{id}

#### ✅ Success (200 OK)

```http
PUT /api/categories/1 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
Content-Type: application/json

{
  "nome": "Trabalho - Atualizado",
  "cor": "#FF0000"
}
```

**Resposta:**
```json
{
  "id": 1,
  "nome": "Trabalho - Atualizado",
  "cor": "#FF0000",
  "created_at": "2026-03-25T10:00:00.000000Z",
  "updated_at": "2026-04-01T10:35:00.000000Z"
}
```

---

### DELETE /api/categories/{id}

#### ✅ Success (204 No Content)

```http
DELETE /api/categories/8 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:** Vazio (apenas status 204)

---

## Badges

**Base URL:** `/api/badges`  
**Autenticação:** ✅ Obrigatória  
**Nota:** Badges são geradas automaticamente pelo sistema

### GET /api/badges

#### ✅ Success (200 OK)

```http
GET /api/badges HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:**
```json
{
  "data": [
    {
      "id": 1,
      "nome": "Trabalho",
      "descricao": "Badge principal da categoria Trabalho",
      "icon": "briefcase",
      "category_id": 1,
      "milestone": null,
      "percentage": 45.5,
      "created_at": "2026-03-25T10:00:00.000000Z",
      "updated_at": "2026-03-25T10:00:00.000000Z"
    },
    {
      "id": 2,
      "nome": "Trabalho - Iniciante",
      "descricao": "1 tarefa concluída em Trabalho",
      "icon": "star",
      "category_id": 1,
      "milestone": "iniciante",
      "percentage": 25.0,
      "created_at": "2026-03-25T10:00:00.000000Z",
      "updated_at": "2026-03-25T10:00:00.000000Z"
    }
  ],
  "links": {...},
  "meta": {...}
}
```

**Pergunta:** Deve `GET /api/me` incluir badges?  
**Resposta Confirmada:** NÃO, mas seria útil adicionar um campo `user_badges` em `GET /api/me` com as badges que o utilizador possui.

---

## Stats

**Base URL:** `/api/stats`  
**Autenticação:** ✅ Obrigatória + Admin

### GET /api/stats/users-growth?period=year&year=2026

#### ✅ Success (200 OK)

```http
GET /api/stats/users-growth?period=year&year=2026 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:**
```json
{
  "period": "year",
  "year": 2026,
  "month": null,
  "days_in_month": null,
  "current_day": null,
  "total_weeks": null,
  "labels": [
    "Apr"
  ],
  "datasets": [
    {
      "label": "Novos Users",
      "data": [
        9
      ],
      "borderColor": "#FF5733",
      "backgroundColor": "rgba(255, 87, 51, 0.1)",
      "tension": 0.1
    }
  ]
}
```

---

### GET /api/stats/users-growth?period=month&year=2026&month=4

#### ✅ Success (200 OK)

```http
GET /api/stats/users-growth?period=month&year=2026&month=4 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta:**
```json
{
  "period": "month",
  "year": 2026,
  "month": 4,
  "days_in_month": 30,
  "current_day": 1,
  "total_weeks": 5,
  "labels": [
    "Week 1"
  ],
  "datasets": [
    {
      "label": "Novos Users",
      "data": [
        9
      ],
      "borderColor": "#FF5733",
      "backgroundColor": "rgba(255, 87, 51, 0.1)",
      "tension": 0.1
    }
  ]
}
```

#### ❌ Error: Não é admin (403)

```http
GET /api/stats/users-growth?period=year&year=2026 HTTP/1.1
Authorization: Bearer 4|AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

**Resposta (403 Forbidden):**
```json
{
  "message": "Apenas administradores podem aceder a este recurso"
}
```

#### ❌ Error: Validação (422)

```http
GET /api/stats/users-growth?period=invalid&year=2026 HTTP/1.1
Authorization: Bearer 3|nZlb8jCedPXqRdbItvXbiEmVDp3wYw0TcM0jiT8Q4e0a7b8
```

**Resposta (422 Unprocessable Entity):**
```json
{
  "message": "The period field must be one of: year, month.",
  "errors": {
    "period": [
      "The period field must be one of: year, month."
    ]
  }
}
```

---

## Estruturas de Erro

### Padrão 401 Unauthorized

```json
{
  "message": "Unauthenticated."
}
```

### Padrão 403 Forbidden

```json
{
  "message": "This action is unauthorized."
}
```

Ou para admin-only:

```json
{
  "message": "Apenas administradores podem aceder a este recurso"
}
```

### Padrão 404 Not Found

```json
{
  "message": "[Recurso] não encontrado"
}
```

### Padrão 422 Unprocessable Entity

```json
{
  "message": "The field is required. (and X more errors)",
  "errors": {
    "field1": [
      "Mensagem de erro Field 1"
    ],
    "field2": [
      "Mensagem de erro Field 2"
    ]
  }
}
```

### Padrão 500 Internal Server Error

```json
{
  "message": "Server Error"
}
```

---

## Padrões Globais

### Paginação

Todas as respostas que retornam múltiplos recursos usam paginação com este padrão:

```json
{
  "data": [...],
  "links": {
    "first": "http://localhost:8000/api/tasks?page=1",
    "last": "http://localhost:8000/api/tasks?page=3",
    "prev": "http://localhost:8000/api/tasks?page=1",
    "next": "http://localhost:8000/api/tasks?page=3"
  },
  "meta": {
    "current_page": 2,
    "from": 16,
    "last_page": 3,
    "links": [
      {
        "url": "http://localhost:8000/api/tasks?page=1",
        "label": "1",
        "active": false
      },
      {
        "url": "http://localhost:8000/api/tasks?page=2",
        "label": "2",
        "active": true
      },
      {
        "url": "http://localhost:8000/api/tasks?page=3",
        "label": "3",
        "active": false
      }
    ],
    "path": "http://localhost:8000/api/tasks",
    "per_page": 15,
    "to": 30,
    "total": 45
  }
}
```

### Format de Datas

**Formato:** ISO 8601 (UTC com timezone specification)

```
"2026-04-01T10:14:01.000000Z"
```

Conversão para JavaScript:
```javascript
new Date("2026-04-01T10:14:01.000000Z")
```

### Enums

#### Estado (Task)
- `"pendente"` - Tarefa não iniciada ou em progresso
- `"concluída"` - Tarefa completada

#### Prioridade (Task)
- `"baixa"`
- `"média"`
- `"alta"`

#### Milestone (Badge)
- `null` - Badge da categoria principal
- `"iniciante"` - 1 tarefa concluída
- `"intermediário"` - 10 tarefas concluídas
- `"avançado"` - 50 tarefas concluídas
- `"especialista"` - 100 tarefas concluídas

#### Period (Stats)
- `"year"` - Estatísticas anuais
- `"month"` - Estatísticas mensais

### Naming Convention

**Resposta:** `snake_case` em TODAS as respostas JSON

Exemplos:
- `is_admin` (não `isAdmin`)
- `data_vencimento` (não `dueDate`)
- `categoria_id` (não `categoryId`)
- `created_at` (não `createdAt`)
- `user_id` (não `userId`)

### Campos Obrigatórios vs Opcionais

#### Task (POST/PUT)

| Campo | Obrigatório | Tipo | Valores |
|-------|---|---|---|
| `titulo` | ✅ | string | - |
| `descricao` | ❌ | string/null | - |
| `estado` | ❌ | enum | pendente, concluída |
| `prioridade` | ❌ | enum | baixa, média, alta |
| `data_vencimento` | ❌ | date (YYYY-MM-DD) | - |
| `category_id` | ❌ | integer | - |
| `user_id` | ❌ (injected) | integer | Preenchido automaticamente |

#### Category (POST)

| Campo | Obrigatório | Tipo | Notas |
|-------|---|---|---|
| `nome` | ✅ | string | Deve ser único |
| `cor` | ✅ | string | Formato hex: #RRGGBB |

#### Login/Register

| Campo | Obrigatório | Tipo |
|-------|---|---|
| `email` | ✅ | string |
| `password` | ✅ | string |
| `name` | ✅(register) | string |

---

## Resumo de Confirmações

| Aspecto | Resposta |
|--------|----------|
| `GET /api/me` inclui badges? | ❌ NÃO (seria útil adicionar) |
| Update tarefa retorna badges? | ❌ NÃO (seria útil retornar `new_badges`) |
| Paginação {data, links, meta}? | ✅ SIM (exceto singular como POST create) |
| Datas em ISO 8601? | ✅ SIM |
| Naming convention snake_case? | ✅ SIM |
| Validação 422 {message, errors}? | ✅ SIM |
| Erro 401 padrão? | ✅ "Unauthenticated." |
| Erro 403 padrão? | ✅ "This action is unauthorized." |

---

**Último update:** 2026-04-01T10:35:00Z
