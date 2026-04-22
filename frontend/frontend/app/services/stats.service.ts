import { Injectable, inject } from '@angular/core';
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

export type AvailableYearsAndMonths = Record<string | number, number[]>;

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  /**
   * Injeção de dependência
   */
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stats`;  // URL base para endpoints de stats (admin only)

  /**
   * Endpoint: GET /stats/available-years-months
   * Obter anos e meses para os quais existem dados de utilizadores.
   * 
   * Retorna:
   *  Record<year, months[]>
   *  Ex: { "2024": [1, 2, 3, ...], "2025": [1, 2, ...] }
   * 
   * Usado para:
   *  - Preenchimento de dropdowns de filtro
   *  - Validar que dados existem antes de carregar gráficos
   */
  getAvailableYearsAndMonths(): Observable<AvailableYearsAndMonths> {
    return this.http.get<AvailableYearsAndMonths>(
      `${this.apiUrl}/available-years-months`
    );
  }

  /**
   * Endpoint: GET /stats/users-growth
   * Obter dados de crescimento de utilizadores para um ano.
   * 
   * Parâmetros:
   *  - period: "year" (obriga todos os 12 meses)
   *  - year: ex 2024, 2025
   * 
   * Retorna:
   *  - labels: ["Jan", "Feb", "Mar", ...] ou datas no formato escolhido
   *  - datasets: gráfico com cores, tensão de curva, etc
   * 
   * Formato Chart.js:
   *  - Pronto para passar a ng-charts ou chart.js
   */
  getUsersGrowthByYear(year: number): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(
      `${this.apiUrl}/users-growth?period=year&year=${year}`
    );
  }
}
