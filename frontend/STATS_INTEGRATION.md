# Integração de Estatísticas (Stats) - Frontend Angular

This guide provides a complete integration of user growth statistics dashboard into your Angular frontend using Chart.js for visualization.

## Quick Start

```bash
# 1. Install dependencies
npm install chart.js ng2-charts

# 2. Copy the files from this guide
# - StatsService (src/app/services/stats.service.ts)
# - StatsComponent (src/app/components/stats/)

# 3. Import NgChartsModule in your AppModule

# 4. Add <app-stats></app-stats> to your template
```

## Baseline Prerequisites

- Angular 17+ (Standalone or Module-based)
- HttpClientModule configured
- Environment variables set with `apiUrl`
- Sanctum authentication token available
- User account with `is_admin = true` flag

```bash
npm install chart.js ng2-charts
```

## 2. Importar no AppModule

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgChartsModule } from 'ng2-charts';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

## 3. Criar StatsService

```typescript
// src/app/services/stats.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StatsResponse {
  period: 'year' | 'month';
  year: number;
  month?: number;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = `${environment.apiUrl}/stats`;

  constructor(private http: HttpClient) { }

  /**
   * Obter dados de crescimento de utilizadores por ano
   * @param year - Ano desejado
   */
  getUsersGrowthYear(year: number): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(
      `${this.apiUrl}/users-growth?period=year&year=${year}`
    );
  }

  /**
   * Obter dados de crescimento de utilizadores por mês
   * @param year - Ano desejado
   * @param month - Mês desejado (1-12)
   */
  getUsersGrowthMonth(year: number, month: number): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(
      `${this.apiUrl}/users-growth?period=month&year=${year}&month=${month}`
    );
  }
}
```

## 4. Criar Componente Stats

```typescript
// src/app/components/stats/stats.component.ts
import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData } from 'chart.js';
import { StatsService, StatsResponse } from '../../services/stats.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  isLoading = false;
  error: string | null = null;
  
  period: 'year' | 'month' = 'year';
  year: number = new Date().getFullYear();
  month: number = new Date().getMonth() + 1;
  
  chartData: ChartData<'line'> | null = null;
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Crescimento de Utilizadores'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  constructor(private statsService: StatsService) { }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.error = null;

    const request$ = this.period === 'year'
      ? this.statsService.getUsersGrowthYear(this.year)
      : this.statsService.getUsersGrowthMonth(this.year, this.month);

    request$.subscribe({
      next: (data: StatsResponse) => {
        this.chartData = {
          labels: data.labels,
          datasets: [
            {
              label: data.datasets[0].label,
              data: data.datasets[0].data,
              borderColor: data.datasets[0].borderColor,
              backgroundColor: data.datasets[0].backgroundColor,
              tension: data.datasets[0].tension,
              fill: true,
            }
          ]
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar stats:', err);
        this.error = 'Falha ao carregar dados de estatísticas';
        this.isLoading = false;
      }
    });
  }

  changePeriod(newPeriod: 'year' | 'month'): void {
    this.period = newPeriod;
    this.loadStats();
  }

  changeYear(newYear: number): void {
    this.year = newYear;
    this.loadStats();
  }

  changeMonth(newMonth: number): void {
    this.month = newMonth;
    this.loadStats();
  }
}
```

## 5. Template do Componente

```html
<!-- src/app/components/stats/stats.component.html -->
<div class="stats-container">
  <h1>Estatísticas de Utilizadores</h1>
  
  <!-- Controls -->
  <div class="controls">
    <div class="period-selector">
      <button 
        [class.active]="period === 'year'"
        (click)="changePeriod('year')">
        Por Ano
      </button>
      <button 
        [class.active]="period === 'month'"
        (click)="changePeriod('month')">
        Por Mês
      </button>
    </div>

    <!-- Year selector -->
    <div class="year-selector">
      <label>Ano:</label>
      <input 
        type="number" 
        [(ngModel)]="year"
        [min]="2026"
        [max]="year"
        (change)="changeYear(year)">
    </div>

    <!-- Month selector (only show if period is month) -->
    <div class="month-selector" *ngIf="period === 'month'">
      <label>Mês:</label>
      <select [(ngModel)]="month" (change)="changeMonth(month)">
        <option *ngFor="let m of [1,2,3,4,5,6,7,8,9,10,11,12]" [value]="m">
          {{ getMonthName(m) }}
        </option>
      </select>
    </div>
  </div>

  <!-- Loading state -->
  <div *ngIf="isLoading" class="loading">
    Carregando dados...
  </div>

  <!-- Error state -->
  <div *ngIf="error" class="error">
    {{ error }}
  </div>

  <!-- Chart -->
  <div *ngIf="chartData && !isLoading && !error" class="chart-container">
    <canvas 
      baseChart
      type="line"
      [data]="chartData"
      [options]="chartOptions">
    </canvas>
  </div>
</div>
```

## 6. Estilos (CSS)

```css
/* src/app/components/stats/stats.component.css */
.stats-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.controls {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.period-selector,
.year-selector,
.month-selector {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.period-selector button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.period-selector button.active {
  background: #FF5733;
  color: white;
  border-color: #FF5733;
}

.period-selector button:hover:not(.active) {
  border-color: #FF5733;
}

input[type="number"],
select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.loading,
.error {
  padding: 2rem;
  text-align: center;
  border-radius: 8px;
  margin: 2rem 0;
}

.loading {
  background: #e3f2fd;
  color: #1976d2;
}

.error {
  background: #ffebee;
  color: #c62828;
}

.chart-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}
```

## 7. Variáveis Environment

Certifica-te que tens configurado corretamente em `src/environments/environment.ts`:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://seu-dominio.com/api'
};
```

## 8. Usar o Componente

Adiciona o componente no teu módulo ou rota:

```typescript
// app.module.ts
import { StatsComponent } from './components/stats/stats.component';

@NgModule({
  declarations: [StatsComponent],
  imports: [CommonModule, HttpClientModule, NgChartsModule, FormsModule],
  exports: [StatsComponent]
})
export class StatsModule { }
```

E no template principal:

```html
<app-stats></app-stats>
```

## 9. Tratamento de Autenticação

Se a requisição precisar do token Sanctum (como faz), certifica-te que tens um interceptor:

```typescript
// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
```

E registar no AppModule:

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class AppModule { }
```

---

## ✅ Pronto!

Agora tens uma integração completa de stats no teu Angular com:
- ✅ Serviço para consumir a API
- ✅ Componente com Chart.js
- ✅ Seletores de período/ano/mês
- ✅ Tratamento de erros
- ✅ Loading states

**Próximos passos:**
1. Adapta os estilos do CSS ao design do teu app
2. Integra com o módulo de routing
3. Testa em produção com `ng build --prod`
