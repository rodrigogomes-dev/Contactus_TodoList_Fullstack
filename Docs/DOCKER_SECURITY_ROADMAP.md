# 🚀 DOCKER SECURITY ROADMAP

**Objetivo**: Preparar projeto para Docker com segurança implementada  
**Status Geral**: 53% implementado  
**Próximo Milestone**: 80% até semana que vem (Docker Compose)

---

## 📋 TAREFAS CRÍTICAS (Bloqueia Docker)

### ✅ [FASE 1] CORS - Permitir comunicação Frontend + Backend

**Descrição**: Frontend não consegue chamar API sem CORS configurado

```
📁 backend/config/
   ├── cors.php ❌ CRIAR
   └── ...
```

**Tarefas**:
- [ ] T1.1: Criar ficheiro `backend/config/cors.php` com domínios permitidos
- [ ] T1.2: Registar middleware HandleCors em `bootstrap/app.php`
- [ ] T1.3: Testar com curl: `curl -H "Origin: http://localhost:4200" http://localhost:8000/api/...`

**Ficheiros afetados**:
- Criar: [config/cors.php](../backend/config/cors.php) (novo)
- Editar: [bootstrap/app.php](../backend/bootstrap/app.php)

**Nota**: HandleCors middleware já existe, apenas precisa registar.

---

### ✅ [FASE 2] RATE LIMITING - Proteger contra brute force

**Descrição**: Login/register sem proteção = vulnerável a ataques

```
🛡️ Implementar throttle em:
   ├── POST /api/login       → 60 req/min
   ├── POST /api/register    → 60 req/min
   └── GET  /api/*           → 1000 req/min (app-wide)
```

**Tarefas**:
- [ ] T2.1: Adicionar `middleware(['throttle:60,1'])` em `/api/login`
- [ ] T2.2: Adicionar `middleware(['throttle:60,1'])` em `/api/register`
- [ ] T2.3: Considerar `middleware('throttle:1000,1')` para toda a app
- [ ] T2.4: Testar com Apache Bench: `ab -n 100 -c 10 http://localhost:8000/api/login`

**Ficheiros afetados**:
- Editar: [routes/api.php](../backend/routes/api.php)

---

### ✅ [FASE 3] RBAC (POLICIES) - Quem pode fazer o quê

**Descrição**: Sem policies, qualquer user pode editar tarefas de outro

```
🔐 Criar Policies:
   ├── app/Policies/
   │   ├── TaskPolicy.php ❌ CRIAR
   │   ├── CategoryPolicy.php ❌ CRIAR
   │   └── BadgePolicy.php ❌ CRIAR
   └── app/Providers/AppServiceProvider.php (registar)
```

**Tarefas**:
- [ ] T3.1: Criar `app/Policies/TaskPolicy.php`
  - [ ] Método `view(User $user, Task $task)` → Apenas dono ou admin
  - [ ] Método `create(User $user)` → Qualquer user autenticado
  - [ ] Método `update(User $user, Task $task)` → Apenas dono ou admin
  - [ ] Método `delete(User $user, Task $task)` → Apenas dono ou admin
  
- [ ] T3.2: Criar `app/Policies/CategoryPolicy.php`
  - [ ] Mesmo padrão: apenas dono + admin
  
- [ ] T3.3: Criar `app/Policies/BadgePolicy.php`
  - [ ] Policy para badges (admin-only?)

- [ ] T3.4: Registar policies em `AppServiceProvider::boot()`
  ```php
  Gate::policy(Task::class, TaskPolicy::class);
  Gate::policy(Category::class, CategoryPolicy::class);
  Gate::policy(Badge::class, BadgePolicy::class);
  ```

- [ ] T3.5: Usar policies nos Controllers
  ```php
  // Em TaskController@update
  $this->authorize('update', $task);
  ```

**Ficheiros afetados**:
- Criar: [app/Policies/TaskPolicy.php](../backend/app/Policies/TaskPolicy.php) (novo)
- Criar: [app/Policies/CategoryPolicy.php](../backend/app/Policies/CategoryPolicy.php) (novo)
- Criar: [app/Policies/BadgePolicy.php](../backend/app/Policies/BadgePolicy.php) (novo)
- Editar: [app/Providers/AppServiceProvider.php](../backend/app/Providers/AppServiceProvider.php)
- Editar: Controllers em [app/Http/Controllers/Api/](../backend/app/Http/Controllers/Api/)

---

### ✅ [FASE 4] DATA MASKING - Esconder dados sensíveis

**Descrição**: Responses expostas em logs, respostas API devem ser limpas

```
📝 Revistar Resources:
   ├── app/Http/Resources/
   │   ├── UserResource.php
   │   ├── TaskResource.php
   │   ├── CategoryResource.php
   │   └── BadgeResource.php
```

**Tarefas**:
- [ ] T4.1: Revistar UserResource
  - [ ] Remover: `password`, `remember_token`, `email_verified_at` (sensível?)
  - [ ] Manter: `id`, `name`, `email`, `avatar_url`, `is_admin`, `created_at`
  - [ ] Adicionar: `badges` relationship

- [ ] T4.2: Revistar TaskResource
  - [ ] Verificar: não expõe informação de outro user
  - [ ] Adicionar: `can_edit`, `can_delete` (permissões client-side)

- [ ] T4.3: Revistar CategoryResource
  - [ ] Manter campos públicos
  - [ ] Validar: user só vê categorias próprias

- [ ] T4.4: Revistar BadgeResource
  - [ ] Público (badges são para gamification)

- [ ] T4.5: Revistar error responses em exception handlers
  - [ ] Não expor stack traces em produção
  - [ ] Verificar: `APP_DEBUG=false` em `.env.production`

**Ficheiros afetados**:
- Editar: [app/Http/Resources/](../backend/app/Http/Resources/)
- Revistar: Exception handlers

---

## 🟡 TAREFAS IMPORTANTES (Recomendado)

### [FASE 5] ENCRIPTAÇÃO AT REST - Dados sensíveis no BD

**Descrição**: GDPR: dados pessoais devem estar encriptados em repouso

```
🔐 Adicionar encriptação a:
   ├── User.nif (CPF)
   ├── User.morada (Endereço)
   └── User.phone (Telefone)
```

**Tarefas**:
- [ ] T5.1: Adicionar mutators em User model
  ```php
  #[Encrypted]
  public string $nif;
  ```
  
- [ ] T5.2: Testar encriptação/desencriptação
- [ ] T5.3: Verificar: campos já existem no BD?

**Ficheiros afetados**:
- Editar: [app/Models/User.php](../backend/app/Models/User.php)

---

### [FASE 6] MENOR PRIVILÉGIO (Database User)

**Descrição**: Usar utilizador BD específico, não root (Docker)

**Tarefas**:
- [ ] T6.1: Criar utilizador BD: `docker_app` (apenas SELECT, INSERT, UPDATE, DELETE)
- [ ] T6.2: Revocar permissões: DROP, ALTER, CREATE
- [ ] T6.3: Atualizar .env para Docker com novas credenciais
- [ ] T6.4: Documentar em docker-compose.yml

**Ficheiros afetados**:
- Editar: [backend/.env](../backend/.env) (Docker version)
- Criar: docker-compose.yml (futuro)

---

### [FASE 7] VERIFICAR FORMREQUESTS

**Descrição**: Todas as rotas POST/PATCH/DELETE têm validação server-side

**Tarefas**:
- [ ] T7.1: Listar rotas: POST /api/tasks, PATCH /api/tasks/:id, DELETE /api/tasks/:id, etc.
- [ ] T7.2: Confirmar cada uma usa FormRequest
- [ ] T7.3: Revistar validações são suficientes
- [ ] T7.4: Testar com dados inválidos

**Ficheiros afetados**:
- Revistar: [app/Http/Requests/](../backend/app/Http/Requests/)
- Revistar: [routes/api.php](../backend/routes/api.php)

---

### [FASE 8] AUDITORIA COMPLETA

**Descrição**: TaskObserver + CategoryObserver registam user_id + timestamps

**Tarefas**:
- [ ] T8.1: Revistar [app/Observers/TaskObserver.php](../backend/app/Observers/TaskObserver.php)
  - [ ] `created()` registar user_id?
  - [ ] `updated()` registar user_id + campos alterados?
  - [ ] `deleted()` registar user_id?

- [ ] T8.2: Revistar [app/Observers/CategoryObserver.php](../backend/app/Observers/CategoryObserver.php)
  - [ ] Mesmo padrão

- [ ] T8.3: Adicionar logging se necessário
  ```php
  Log::info('Task created', ['user_id' => auth()->id(), 'task_id' => $task->id()]);
  ```

**Ficheiros afetados**:
- Editar: [app/Observers/TaskObserver.php](../backend/app/Observers/TaskObserver.php)
- Editar: [app/Observers/CategoryObserver.php](../backend/app/Observers/CategoryObserver.php)

---

## 🟢 TAREFAS NICE-TO-HAVE (Depois)

- [ ] **HTTPS/TLS**: Configure via Docker Nginx reverse proxy
- [ ] **HSTS Headers**: Depende de HTTPS
- [ ] **Angular Validations**: Revistar formulários client-side + feedback visual
- [ ] **Secrets Management**: Usar HashiCorp Vault ou AWS Secrets Manager (produção)

---

## 📊 TRACKING

| Fase | Tarefa | Status | Responsável | Prazo |
|------|--------|--------|-------------|-------|
| 1 | CORS | [ ] Não iniciado | - | - |
| 2 | Rate Limit | [ ] Não iniciado | - | - |
| 3 | RBAC | [ ] Não iniciado | - | - |
| 4 | Data Masking | [ ] Não iniciado | - | - |
| 5 | Encriptação | [ ] Não iniciado | - | - |
| 6 | DB User | [ ] Não iniciado | - | - |
| 7 | FormRequest | [ ] Não iniciado | - | - |
| 8 | Auditoria | [ ] Não iniciado | - | - |

---

## 🔗 REFERÊNCIAS

- [Laravel CORS Configuration](https://laravel.com/docs/11.x/cors)
- [Laravel Rate Limiting](https://laravel.com/docs/11.x/routing#rate-limiting)
- [Laravel Authorization & Policies](https://laravel.com/docs/11.x/authorization)
- [Laravel Encryption](https://laravel.com/docs/11.x/encryption)
- [Laravel Sanctum](https://laravel.com/docs/11.x/sanctum)
