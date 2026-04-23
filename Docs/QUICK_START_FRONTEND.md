# Quick Start - Frontend Angular - Desenvolvimento Local

> ⚠️ **Se está a usar Docker, vá para [DOCKER_README.md](../DOCKER_README.md)**

Este guia é **APENAS** para desenvolvimento local sem Docker.

---

## 🎯 Setup em 2 minutos

### 1. Pré-requisitos

```bash
node --version     # Node 20+
ng version         # Angular CLI
```

Se faltar Angular CLI:
```bash
npm install -g @angular/cli
```

### 2. Instalar dependências

```bash
cd frontend/frontend
npm install
```

### 3. Configurar API

Editar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

### 4. Iniciar dev server

```bash
ng serve -o
```

Acesso: **http://localhost:4200**

---

## 📝 Observações

- **Backend deve estar a correr** (http://localhost:8000/api)
- Autenticação via token Bearer (localStorage)
- Hot-reload automático em mudanças de código
})
export class AppModule { }
```

## Serviços Principais

### AuthService

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.getMe().subscribe();
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        localStorage.setItem('auth_token', response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('auth_token');
        this.currentUserSubject.next(null);
      })
    );
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}
```

### TaskService

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) { }

  getTasks(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getTask(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createTask(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateTask(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

### CategoryService

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) { }

  getCategories(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getCategory(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCategory(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

### StatsService

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private apiUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) { }

  getUsersGrowthYear(year: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users-growth?period=year&year=${year}`);
  }

  getUsersGrowthMonth(year: number, month: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users-growth?period=month&year=${year}&month=${month}`);
  }
}
```

## Componentes Principais

### Dashboard

Crie `src/app/components/dashboard/dashboard.component.ts`:

```typescript
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
}
```

### Stats Dashboard

Para integração completa de estatísticas, consulte [STATS_INTEGRATION.md](STATS_INTEGRATION.md).

## Rotas Recomendadas

```typescript
// app.routes.ts (Standalone) ou app-routing.module.ts
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'tasks', component: TasksComponent },
      { path: 'stats', component: StatsComponent }
    ]
  }
];
```

## Testing

```bash
# Run unit tests
ng test

# Run e2e tests
ng e2e

# Build for production
ng build --prod
```

## Deploy

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

### Firebase

```bash
npm i -g firebase-tools
firebase login
firebase init
firebase deploy
```

## Troubleshooting

### CORS Errors
- Certifique-se que `http://localhost:4200` está configurado em `config/cors.php` no Laravel

### 401 Unauthorized
- Verifique se o token está sendo enviado corretamente no header `Authorization: Bearer {token}`
- Teste o login no Postman/Insomnia primeiro

### 403 Forbidden (Stats)
- Certifique-se que o utilizador logado é admin (`is_admin = true`)

## Próximos Passos

1. Implementar autenticação com login page
2. Criar layout principal com navegação
3. Implementar CRUD de tarefas
4. Integrar estatísticas com Chart.js
5. Adicionar testes unitários
6. Configurar deploy automático

## Recursos Adicionais

- [README.md](README.md) - Documentação completa do backend
- [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) - Arquitetura da API
- [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) - Guia detalhado de integração
- [STATS_INTEGRATION.md](STATS_INTEGRATION.md) - Integração de estatísticas

---

