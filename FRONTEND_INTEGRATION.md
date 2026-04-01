# Guia de Integração Frontend

Este documento descreve como integrar um frontend Angular/TypeScript com este backend Laravel.

## Configuração Base

### URL da API

Configure a URL base da API no seu servidor de desenvolvimento:

```typescript
// environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};

// environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://seu-dominio.com/api'
};
```

### CORS

O backend já está configurado para aceitar pedidos de:
- http://localhost:3000
- http://localhost:4200
- http://localhost:8000

Se alterar a porta, adicione-a em `config/cors.php`.

## Estrutura de Serviços

### AuthService

Responsável por autenticação e gestão de tokens.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}`;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // Registar novo utilizador
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, {
      name,
      email,
      password
    }).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  // Fazer login
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  // Fazer logout
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.removeToken();
        this.currentUserSubject.next(null);
      })
    );
  }

  // Obter dados do utilizador autenticado
  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  // Gestão de tokens
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private getUserFromStorage(): any {
    const token = this.getToken();
    return token ? { token } : null;
  }
}
```

### TaskService

Gestão de tarefas.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) { }

  // Listar tarefas do utilizador autenticado
  getMyTasks(userId?: number): Observable<any> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('user_id', userId);
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  // Obter tarefa específica
  getTask(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Criar tarefa
  createTask(taskData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, taskData);
  }

  // Atualizar tarefa
  updateTask(id: number, taskData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, taskData);
  }

  // Deletar tarefa
  deleteTask(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Marcar tarefa como concluída
  completeTask(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, {
      estado: 'concluída'
    });
  }
}
```

### CategoryService

Gestão de categorias.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getCategory(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCategory(categoryData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, categoryData);
  }

  updateCategory(id: number, categoryData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, categoryData);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
```

### BadgeService

Gestão de badges.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {
  private apiUrl = `${environment.apiUrl}/badges`;

  constructor(private http: HttpClient) { }

  getBadges(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getBadge(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createBadge(badgeData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, badgeData);
  }

  updateBadge(id: number, badgeData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, badgeData);
  }

  deleteBadge(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
```

## Como Funciona o Sistema de Badges

### Visão Geral

O sistema de badges combina 3 partes no backend:

- **Catálogo de badges** (`/api/badges`): lista de todas as badges possíveis.
- **Atribuição automática** (Observers): badges são atribuídas quando o utilizador conclui tarefas e atinge marcos.
- **Badges do utilizador autenticado** (`/api/me`): devolve o utilizador com relações `tasks` e `badges` carregadas.

### Fluxo de Criação e Ganho de Badges

1. Quando uma categoria é criada, o backend cria automaticamente badges dessa categoria.
2. Quando uma tarefa muda para estado concluído, o backend calcula o progresso do utilizador.
3. Se o utilizador atingir um milestone, o backend associa a badge na relação many-to-many (`badge_user`).
4. O frontend volta a chamar `/api/me` (ou atualiza estado local) para refletir as novas badges no ecrã.

### Regras de Atribuição (Atual)

- **Globais por tarefas concluídas**: 1, 10, 50, 100 tarefas.
- **Por categoria**: badge de especialista ao completar 10 tarefas na mesma categoria.
- **Sem duplicação**: o backend verifica se o utilizador já possui a badge antes de associar.

### Endpoints que o Frontend Deve Usar

- `GET /api/badges`: catálogo completo de badges (com `percentage`).
- `GET /api/me`: dados do utilizador autenticado com `badges` ganhas.
- `PUT /api/tasks/{id}`: atualizar tarefa para estado concluído e disparar lógica de badges.

### Exemplo de Sincronização no Frontend

Depois de concluir uma tarefa com sucesso:

1. Atualizar lista de tarefas.
2. Recarregar perfil do utilizador com `AuthService.getMe()`.
3. Atualizar widgets de badges (ex.: contador total, últimas badges ganhas, progresso por categoria).

### Campos Úteis para UI

No objeto de badge retornado pela API, use estes campos para renderização:

- `nome` e `descricao`: texto da badge.
- `icon`: seed base do ícone.
- `icon_url` (accessor): URL pronta para exibir imagem.
- `milestone`: nível (`iniciante`, `intermediário`, `avançado`, `especialista` ou `null`).
- `percentage`: percentagem de utilizadores que já ganharam a badge.

### Boas Práticas de UX

- Mostrar feedback imediato quando uma nova badge é desbloqueada (toast/modal).
- Destacar badges recém-conquistadas em "Minhas Badges".
- Exibir progresso por categoria para incentivar continuidade.
- Usar `percentage` para comunicar raridade da badge.

### AdminService

Funcionalidades administrativas.

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }
}
```

## Interceptador HTTP

Configure um interceptador para adicionar o token de autenticação a todos os pedidos.

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request);
  }
}
```

Registar o interceptador em `app.config.ts`:

```typescript
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    HttpClientModule,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
```

## Guards de Rota

Proteger rotas que requerem autenticação.

```typescript
import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

## Modelos Tipados

Defina interfaces para tipagem forte.

```typescript
// models/user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  avatar_path?: string;
  created_at: string;
  updated_at: string;
}

// models/task.model.ts
export interface Task {
  id: number;
  titulo: string;
  descricao?: string;
  estado: 'pendente' | 'concluída';
  prioridade: 'baixa' | 'média' | 'alta';
  data_vencimento?: string;
  user_id: number;
  category_id: number;
  user?: User;
  category?: Category;
  created_at: string;
  updated_at: string;
}

// models/category.model.ts
export interface Category {
  id: number;
  nome: string;
  cor: string;
  created_at: string;
  updated_at: string;
}

// models/badge.model.ts
export interface Badge {
  id: number;
  nome: string;
  descricao?: string;
  icon: string;
  category_id?: number;
  milestone?: 'iniciante' | 'intermediário' | 'avançado' | 'especialista' | null;
  percentage: number;
  created_at: string;
  updated_at: string;
}
```

## Exemplo de Componente

```typescript
import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task, User } from '../../models';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  currentUser: User | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private taskService: TaskService,
    private authService: AuthService
  ) {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadTasks();
      }
    });
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = null;
    
    this.taskService.getMyTasks().subscribe({
      next: (response) => {
        this.tasks = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar tarefas';
        this.loading = false;
      }
    });
  }

  completeTask(taskId: number): void {
    this.taskService.completeTask(taskId).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        this.error = 'Erro ao atualizar tarefa';
      }
    });
  }

  deleteTask(taskId: number): void {
    if (confirm('Tem a certeza que deseja deletar esta tarefa?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (error) => {
          this.error = 'Erro ao deletar tarefa';
        }
      });
    }
  }
}
```

## Tratamento de Erros

Configure um interceptador para tratar erros HTTP.

```typescript
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expirado ou inválido
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Acesso forbidden
          this.router.navigate(['/forbidden']);
        } else if (error.status === 404) {
          // Recurso não encontrado
          return throwError(() => new Error('Recurso não encontrado'));
        } else if (error.status === 422) {
          // Validação falhou
          return throwError(() => new Error(error.error.message || 'Validação falhou'));
        }

        return throwError(() => new Error('Erro na requisição'));
      })
    );
  }
}
```

## Checklist de Integração

- [ ] NgModule ou standalone imports incluem HttpClientModule
- [ ] Interceptadores registados em app.config.ts ou app.module.ts
- [ ] URL da API configurada em environments
- [ ] AuthService implementado com login/logout
- [ ] TaskService, CategoryService, BadgeService implementados
- [ ] Modelos tipados criados
- [ ] Guards de rota aplicados onde necessário
- [ ] Tratamento de erros implementado
- [ ] Token armazenado em localStorage/sessionStorage
- [ ] Testar login/registro
- [ ] Testar CRUD de tarefas
- [ ] Testar listagem de badges com percentage
- [ ] Testar painel admin (se aplicável)

## Páginas a Criar

### Autenticação
- [ ] **Login** (`/login`) - Página de entrada com email e password
- [ ] **Registro** (`/register`) - Página de criação de conta nova

### Tarefas (CRUD)
- [ ] **Dashboard/Home** (`/dashboard`) - Visão geral com tarefas do utilizador
- [ ] **Listar Tarefas** (`/tasks`) - Lista todas as tarefas com filtros
- [ ] **Criar Tarefa** (`/tasks/new` ou modal) - Formulário para nova tarefa
- [ ] **Editar Tarefa** (`/tasks/:id/edit` ou modal) - Formulário para editar tarefa
- [ ] **Detalhe Tarefa** (`/tasks/:id`) - Visualizar tarefa completa

### Categorias (CRUD)
- [ ] **Listar Categorias** (`/categories`) - Gestão de categorias
- [ ] **Criar Categoria** (modal/form) - Adicionar categoria com escolha de Cor Hexadecimal
- [ ] **Editar Categoria** (modal/form) - Atualizar detalhes da categoria

### Badges & Gamificação
- [ ] **Badges** (`/badges`) - Listar todas as badges com progresso
- [ ] **Minhas Badges** (`/my-badges`) - Badges do utilizador autenticado

### Utilizador
- [ ] **Perfil** (`/profile`) - Ver e editar dados pessoais
- [ ] **Avatar** - Upload/edição de avatar

###  Admin
- [ ] **Painel Admin** (`/admin`) - Estatísticas e gestão
- [ ] **Gestão de Utilizadores** (`/admin/users`) - CRUD de utilizadores
- [ ] **Gestão de Badges** (`/admin/badges`) - CRUD de badges
- [ ] **Gestão de Categorias** (`/admin/categories`) - CRUD de categorias

###  Páginas de Erro
- [ ] **404 - Não Encontrada**
- [ ] **403 - Acesso Proibido**
- [ ] **401 - Não Autenticado** (redireciona para login)

### Prioridade de Implementação
1. Login + Registro
2. Dashboard + Lista de Tarefas (CRUD básico)
3. Perfil + Logout
4. Badges + Categorias
5. Painel Admin

## Dicas Úteis

1. Use observables e async pipe para não ter de fazer subscribe manual
2. Implemente loading states durante requisições HTTP
3. Trate erros adequadamente com feedback ao utilizador
4. Valide dados no frontend antes de enviar ao backend
5. Use RxJS operators para transformar dados conforme necessário
6. Implemente refresh de token se necessário
7. Cache dados que não mudam frequentemente
8. Use lazy loading para módulos/componentes

## Variáveis de Ambiente

Complete este ficheiro `.env.example` para desenvolvimento:

```
ANGULAR_VERSION=17
API_URL=http://localhost:8000/api
ENVIRONMENT=development
```

## Suporte

Para dúvidas sobre a API, consulte o README.md deste projeto.

## Integração de Estatísticas (Stats)

Para integrar o dashboard de estatísticas com gráficos de crescimento de utilizadores, consulte o guia detalhado em [STATS_INTEGRATION.md](STATS_INTEGRATION.md).

### Resumo Rápido

1. Instale Chart.js:
```bash
npm install chart.js ng2-charts
```

2. Crie o `StatsService` para consumir `/api/stats/users-growth`

3. Crie um componente `StatsComponent` que exibe os dados em gráficos

4. Use o componente na página administrativa

### Exemplo Simples

```typescript
// stats.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatsService {
  constructor(private http: HttpClient) {}

  getUsersGrowthYear(year: number) {
    return this.http.get(
      `${environment.apiUrl}/stats/users-growth?period=year&year=${year}`
    );
  }

  getUsersGrowthMonth(year: number, month: number) {
    return this.http.get(
      `${environment.apiUrl}/stats/users-growth?period=month&year=${year}&month=${month}`
    );
  }
}
```

Ver [STATS_INTEGRATION.md](STATS_INTEGRATION.md) para implementação completa com Chart.js.
