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
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stats`;

  /**
   * Get available years and months with user data
   * Returns an object where keys are years and values are arrays of available months
   */
  getAvailableYearsAndMonths(): Observable<AvailableYearsAndMonths> {
    return this.http.get<AvailableYearsAndMonths>(
      `${this.apiUrl}/available-years-months`
    );
  }

  /**
   * Get user growth statistics for a given year
   * Shows all 12 months with user registration growth
   * 
   * @param year - The year to fetch stats for
   */
  getUsersGrowthByYear(year: number): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(
      `${this.apiUrl}/users-growth?period=year&year=${year}`
    );
  }
}
