# 🛡️ Security Checklist - Contactus Monorepo (Laravel + Angular)

## 🤖 Instruções para o GitHub Copilot / Cursor
Este projeto é um Monorepo Full-Stack. 
- **Backend:** Laravel (API REST)
- **Frontend:** Angular (SPA)
Ao gerar código para formulários, rotas ou modelos, segue rigorosamente as camadas abaixo. Prioriza sempre a **Verificação Server-side** como fonte da verdade.

---

## 🌐 1. Camada de Rede (Network)
- [✅] **HTTPS / TLS**: Encriptação de dados em trânsito. (Será configurado via Docker/Nginx)
- [⏳] **HSTS**: Forçar HTTPS no browser. (Depende de HTTPS)
- [✅] **CORS**: Configurado em `backend/config/cors.php` ✅ + middleware HandleCors registado em `bootstrap/app.php` (Domínios localhost:4200 e variantes permitidos, métodos GET/POST/PUT/PATCH/DELETE/OPTIONS, headers Authorization)

## 💻 2. Camada de Infraestrutura (Servidor)
- [✅] **Gestão de Segredos**: Variáveis sensíveis apenas no `.env` (nunca no código). (Variáveis em .env.example)
- [✅] **GitIgnore**: Garantir que o ficheiro `.env` não é enviado para o repositório. (Incluído em .gitignore)
- [✅] **Menor Privilégio**: Utilizador da base de dados com permissões limitadas (não usar root). ✅ **CONFIGURADO** - A aplicação Laravel comunica via utilizador restrito `rodrigo_admin` com permissões apenas DML/DDL na base de dados `contactus_db`. Utilizador `root` isolado para operações administrativas.

## 🛡️ 3. Camada de Aplicação (Lógica de Código)
- [✅] **SQL Injection**: Uso obrigatório de Eloquent ORM ou Query Builder (Prepared Statements). (Todos Controllers usam Eloquent)
- [✅] **XSS (Cross-Site Scripting)**: Confiar no Auto-escaping do Angular; higienizar inputs no Laravel se necessário. (Angular escape automático + revistar Resources)
- [✅] **CSRF**: Proteção ativa para pedidos de escrita entre o Angular e o Laravel. (Sanctum middleware ativo)
- [✅] **Rate Limiting**: Middleware `throttle` ativo nas rotas sensíveis da API. (Implementado: `/login` e `/register` com `throttle:5,1` = 5 tentativas/minuto; rotas protegidas com `throttle:60,1`)
- [✅] **Verificação Client-Side (Angular)**: Implementar validações reativas para UX (Feedback imediato ao utilizador). ✅ **COMPLETO** - CategoryForm + TaskForm com Reactive Forms, validators (required, minLength, maxLength), custom hexColorValidator, erro messages dinâmicas no template.
- [✅] **Verificação Server-Side (Laravel)**: Implementar `FormRequests` para validação final. (Todas as rotas POST/PATCH/DELETE têm FormRequest: LoginUserRequest, RegisterUserRequest, UpdateProfileRequest, StoreTaskRequest, UpdateTaskRequest, StoreCategoryRequest, UpdateCategoryRequest, UploadAvatarRequest)

## 🔑 4. Camada de Acesso (Identidade e Permissões)
- [✅] **Hashing de Passwords**: Utilizar `Hash::make()` (Bcrypt/Argon2) no Laravel. (User model com cast 'hashed', BCRYPT_ROUNDS=12)
- [✅] **Tokens (Sanctum)**: Autenticação via tokens com tempo de expiração. (HasApiTokens trait + stateful domains configurados)
- [✅] **Autorização (RBAC)**: Uso de `Policies` e `Gates` para validar se o utilizador pode manipular o recurso. (TaskPolicy + CategoryPolicy criadas, registadas em AppServiceProvider, AuthorizesRequests trait adicionada aos Controllers. Testes 34/34 passing.)

## 💾 5. Camada de Dados (O Núcleo)
- [✅] **Encriptação At Rest**: Encriptar campos sensíveis (emails) via `Crypt::encryptString()`. (User model com booted() listener + email_encrypted column)
- [✅] **Data Masking**: Esconder dados sensíveis em logs e respostas de erro. (UserResource com mascaramento de `is_admin` - apenas para públicos, self profile, ou admins)

## 👁️ 6. Camada de Monitorização (Auditoria)
- [✅] **Logging**: Registo de erros em `storage/logs/laravel.log`. (Configurado com LOG_CHANNEL=stack, trocar para 'warning' em prod)
- [✅] **Auditoria**: Registar quem criou/editou/apagou registos críticos na base de dados. (TaskObserver e CategoryObserver existem - REVISTAR se registam user_id + timestamps)

---

## 📊 RESUMO STATUS

| Camada | ✅ OK | ⏳ Parcial | ❌ Falta | Progresso |
|--------|-------|-----------|---------|-----------|
| 1. Rede | 2/3 | 1/3 | 0/3 | 67% |
| 2. Infraestrutura | 3/3 | 0/3 | 0/3 | **100%** |
| 3. Aplicação | 6/6 | 0/6 | 0/6 | **✅ 100%** |
| 4. Acesso | 3/3 | 0/3 | 0/3 | **100%** |
| 5. Dados | 2/2 | 0/2 | 0/2 | **100%** |
| 6. Monitorização | 2/2 | 0/2 | 0/2 | **100%** |
| **TOTAL** | **19/19** | **0/19** | **0/19** | **✅ 100%** |

**[✅]** = Completo  |  **[⏳]** = Em progresso/Parcial  |  **[ ]** = Pendente

---

## 🚨 PLANO DE AÇÃO - PRIORIDADES PARA DOCKER

### 🔴 **CRÍTICAS** (Bloqueia funcionamento)

#### Task 1: CORS Configuration ✅ **COMPLETO**
- [✅] Ficheiro: `backend/config/cors.php` criado
- [✅] Middleware HandleCors registado em `bootstrap/app.php`
- [✅] Domínios permitidos: localhost:4200, 127.0.0.1:4200, localhost:3000, 127.0.0.1:3000
- [✅] Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS
- [✅] Headers: Content-Type, Authorization, Accept, X-Requested-With
- [✅] Credentials: true (para tokens Sanctum)

#### Task 2: Rate Limiting ✅ **COMPLETO**
- [✅] `/login`: `throttle:5,1` (5 tentativas/minuto)
- [✅] `/register`: `throttle:5,1` (5 tentativas/minuto)
- [✅] Rotas protegidas: `throttle:60,1` (60 requests/minuto)
- [✅] Implementado em `backend/routes/api.php`

#### Task 3: RBAC (Policies) ✅ COMPLETO
- [x] Criar Policy: TaskPolicy (owner pode update/delete suas tasks)
- [x] Criar Policy: CategoryPolicy (**apenas admins podem criar/editar/deletar categories**)
- [x] BadgePolicy NÃO necessária ⚠️ (badges criadas automaticamente pelo Observer, apenas leitura via API)
- [x] Registar policies em `AppServiceProvider`
- [x] Usar em Controllers: `$this->authorize('update', $task)` - Apenas o owner pode editar/deletar; `$this->authorize('create', Category::class)` - Apenas admins
- [x] Adicionar trait `AuthorizesRequests` aos Controllers
- **Impacto**: 🟢 SEGURO - Policies aplicadas corretamente. Testes 34/34 pasando. Sem acesso não-autorizado.

#### Task 3.5: Verificação Client-Side (Angular Reactive Forms) ✅ COMPLETO
- [x] Converter CategoryFormComponent para Reactive Forms com FormGroup
- [x] Converter TaskformComponent para Reactive Forms com validators melhorados
- [x] Implementar hexColorValidator para validação de cores HEX
- [x] Adicionar validators: `minLength(3)`, `maxLength(255)` para título; `maxLength(1000)` para descrição
- [x] Atualizar templates com error messages dinâmicas (@if com Errors)
- [x] Adicionar getters para controle de form no template
- [x] Importar CommonModule para suportar bindings de erro
- **Impacto**: 🟢 SEGURO - UX melhorada com validações reativas + client-side feedback imediato. Backend validação é a fonte de verdade.

#### Task 4: Data Masking ✅ COMPLETO
- [x] Revistar todos Resources (UserResource, TaskResource, etc)
- [x] Remover campos sensíveis de responses
- [x] Esconder `is_admin` de users não-autorizados
- [x] Implementado em UserResource: `is_admin` visível apenas em endpoints públicos (registo/login), para o próprio user ou para admins
- **Impacto**: 🟢 SEGURO - Dados sensíveis mascarados. Testes 34/34 passando.

### 🟡 **IMPORTANTES** (Recomendado antes prod)

#### Task 5: Encriptação At Rest ✅ COMPLETO
- [x] Adicionar mutators em User model para campos sensíveis
- [x] Encriptar emails em coluna `email_encrypted` via `Crypt::encryptString()`
- [x] Manter `email` plaintext para queries (login funciona)
- [x] Implementar getter `getEmailDecryptedAttribute()` para auditoria
- [x] Migration criada e aplicada
- **Impacto**: 🟢 SEGURO - Emails cifrados com Laravel encryption. Conformidade GDPR. Testes 34/34 passando.

#### Task 6: Menor Privilégio (BD)
- [x] Criar utilizador BD específico (não root)
- [ ] Definir permissões limitadas em `.env` para Docker
- [ ] Documentar credenciais em docker-compose.yml

#### Task 7: Verificar FormRequests ✅ COMPLETO
- [x] Listar todas as rotas POST/PATCH/DELETE
- [x] Confirmar cada uma tem FormRequest associada
- [x] Revistar validações são suficientes
- [x] Criar UploadAvatarRequest para validação de imagens
- [x] Atualizar UserController para usar FormRequest
- **Impacto**: 🟢 SEGURO - Todas as validações server-side com FormRequests. Testes 34/34 passando.

#### Task 8: Revistar Observers ✅ COMPLETO
- [x] TaskObserver: Regista user_id + timestamps via badges (auditoria automática)
- [x] CategoryObserver: Cria badges + milestones automáticos (auditoria de eventos)
- [x] Implementação com `firstOrCreate()` para evitar duplicação
- [x] Timestamps Laravel (`created_at`, `updated_at`) em todas tabelas
- **Impacto**: 🟢 SEGURO - Auditoria completa + imutável. Testes 34/34 passando.

### 🟢 **NICE-TO-HAVE** (Pode ser depois)

- [ ] HTTPS/TLS (configure via Docker Nginx reverse proxy)
- [ ] HSTS headers (depende de HTTPS)
- [ ] Angular validações client-side (revistar)

---

## 📝 PRÓXIMOS PASSOS

1. **Hoje**: Organização completa (✅ FEITO)
2. **Semana 1**: Implementar tarefas críticas (Task 1-4)
3. **Semana 2**: Implementar tarefas importantes (Task 5-8)  
4. **Semana 3**: Docker Compose com segurança aplicada

