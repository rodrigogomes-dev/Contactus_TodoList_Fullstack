# Integração Backend: Angular ↔ Laravel

Este documento define o esquema arquitetural para ligar a nossa SPA Angular a uma API RESTful construida em Laravel no futuro próximo.

## 1. Stack e Ferramentas
- **Frontend:** Angular 19 (Standalone Components, Signals, HttpClient)
- **Backend:** Laravel 11+
- **Autenticação:** Laravel Sanctum (Tokens via Bearer Authentication)
- **Base de Dados:** MySQL/PostgreSQL

## 2. Modelo Relacional da Base de Dados (ERD)

Para suportar todas as funcionalidades atualmente em *Mock* na plataforma, o Laravel precisará destas tabelas principais e respetivos relacionamentos (Migration blueprint logic):

- **`users`**
    - `id`, `name`, `email`, `password`, `role` (enum: 'admin', 'user')
- **`categories`**
    - `id`, `name`, `color`
- **`tasks`**
    - `id`, `user_id` (Relacional F.K.), `category_id` (Relacional F.K.), `title`, `description`, `status` (enum: 'pendente', 'concluido'), `priority` (enum: 'baixa', 'media', 'alta'), `due_date`, `completed_at`
- **`badges`**
    - `id`, `name`, `description`, `icon_name`, `level`, `requirement_type`
- **`user_badges`** (Tabela Pivot Many-to-Many)
    - `user_id`, `badge_id`, `awarded_at`

---

## 3. Endpoints REST da API (Routes)

A API do Laravel deve devolver as respostas padrão de JSON em `routes/api.php`.

### Autenticação (`/api/auth`)
- `POST /login` -> Recebe email/password. Retorna o Token do Sanctum e os dados do user (com o role).
- `POST /logout` -> (Auth Required) Delete current Token.
- `GET /me` -> Retorna os dados do user authenticado (para realimentar state on browser refresh).

### Gestão de Tarefas (`/api/tasks`)
- `GET /tasks` -> Lista as tarefas do User logado apenas. Aceita Params (ex: `?status=pendente`).
- `POST /tasks` -> Cria nova tarefa (`Auth::id()` é herdado no Controller).
- `PUT /tasks/{id}` -> Edita uma tarefa existente.
- `DELETE /tasks/{id}` -> Apaga a tarefa (Soft Delete opcional).

### Gestão de Categorias (`/api/categories`)
- `GET /categories` -> Lista todas as categorias existentes no ecossistema global.
- `POST /categories` -> (Apenas Admin Middleware) Cria nova cor e categoria estrutural.
- `PUT /categories/{id}` -> (Apenas Admin Middleware) Atualiza.
- `DELETE /categories/{id}` -> (Apenas Admin Middleware) Elimina.

### Badges e Dashboards (`/api/badges`, `/api/stats`)
- `GET /my-badges` -> Lista o cruzamento entre as badges e o `User` em questão.
- `GET /stats/users-growth?period=year&year=2026` -> (Apenas Admin) Devolve os arrays agrupados por Mês para um ano específico.
- `GET /stats/users-growth?period=month&year=2026&month=4` -> (Apenas Admin) Devolve os arrays agrupados por Semana para um mês específico.

Os dados são formatados nativamente para Chart.js com campos `labels` e `datasets` preenchidos automaticamente.

---

## 4. O Passo-a-Passo no Lado Angular

No código Angular atual, a substituição do estado "Fictício" (*Mock Data*) pelo comportamento de base de dados real ("Real Data") é estritamente limpo garantindo Zero Stress Visual na UI atual:

1. **Configurar o HTTPClient:**
   No ficheiro mestre `app.config.ts`, importaremos via providers o módulo universal `provideHttpClient()`.
   
2. **Criar Interceptadores Globais (`auth.interceptor.ts`):** 
   Toda a request feita do Angular passa por intercepção e anexa automaticamente aos headers HTTP o padrão de segurança: `Authorization: Bearer <O_TEU_TOKEN>`. A isto juntaremos o `error.interceptor.ts` que escuta por `401 Unauthorized` e empurra o utilizador imediatamente de volta para a tela de `/login`.
   
3. **Mudar os Services (Fim do Mock):**
   Nas classes que gerámos previamente (como o `<CategoryService>` ou `<TaskService>`), o array injetado na RAM desaparecerá para dar lugar ao método RxJS assíncrono padrão: 
   ```typescript
   this.http.get<Categoria[]>('http://localhost:8000/api/categories').subscribe(...)
   ```
