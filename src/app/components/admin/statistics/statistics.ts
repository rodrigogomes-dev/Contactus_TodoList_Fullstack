import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { StatsService, StatsResponse, AvailableYearsAndMonths } from '../../../services/stats.service';

interface UserStats {
  date: string; // 'YYYY-MM-DD'
  count: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics implements OnInit {
  private statsService = inject(StatsService);

  // Available years and months with data
  availableYearsAndMonths = signal<AvailableYearsAndMonths>({});
  availableYears = computed(() => {
    const data = this.availableYearsAndMonths();
    return Object.keys(data)
      .map(y => parseInt(y, 10))
      .sort((a, b) => b - a); // Sort descending (newest first)
  });

  selectedYear = signal<number>(new Date().getFullYear());

  // API Response data
  apiData = signal<StatsResponse | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadAvailableData();
  }

  loadAvailableData() {
    this.statsService.getAvailableYearsAndMonths().subscribe({
      next: (data) => {
        console.log('Available years and months:', data);
        
        // Convert string keys to numbers
        const convertedData: AvailableYearsAndMonths = {};
        Object.keys(data).forEach(yearStr => {
          const year = parseInt(yearStr, 10);
          convertedData[year] = (data as any)[yearStr];
        });
        
        this.availableYearsAndMonths.set(convertedData);
        
        // Set initial year to first available year
        const firstYear = this.availableYears()[0];
        console.log('Available years:', this.availableYears(), 'First year:', firstYear);
        
        if (firstYear) {
          this.selectedYear.set(firstYear);
        }
        
        // Load initial stats
        this.loadStats();
      },
      error: (err) => {
        console.error('Error loading available years/months:', err);
        this.error.set('Falha ao carregar opções de datas');
      }
    });
  }

  loadStats() {
    this.isLoading.set(true);
    this.error.set(null);

    this.statsService.getUsersGrowthByYear(this.selectedYear()).subscribe({
      next: (response) => {
        console.log('Stats response:', response);
        this.apiData.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading stats:', err);
        this.error.set('Falha ao carregar dados de estatísticas');
        this.isLoading.set(false);
      }
    });
  }

  // Convert API response to local UserStats format
  filteredData = computed(() => {
    const response = this.apiData();
    if (!response) return [];

    // Map all 12 months, filling with 0 for months without data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Create a map of existing data from response
    const dataMap = new Map<string, number>();
    response.labels.forEach((label, index) => {
      dataMap.set(label, response.datasets[0]?.data[index] || 0);
    });

    // Return all 12 months with data or 0
    return monthNames.map(month => ({
      date: month,
      count: dataMap.get(month) || 0
    }));
  });

  // Estatísticas no topo
  totalUsers = computed(() => this.filteredData().reduce((sum, item) => sum + item.count, 0));
  maxInADay = computed(() => {
    const data = this.filteredData();
    return data.length > 0 ? Math.max(...data.map(d => d.count)) : 0;
  });

  // Configuração Chart.js
  public lineChartType: ChartType = 'line';

  // Usamos computed para que o gráfico reconstrua os datasets sempre que os filtros mudarem
  public lineChartData = computed<ChartConfiguration['data']>(() => {
    const data = this.filteredData();
    
    return {
      datasets: [
        {
          data: data.map(d => d.count),
          label: 'Novos Registos',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          borderColor: '#007bff',
          pointBackgroundColor: '#007bff',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#007bff',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: 'origin', // Preenche a área debaixo da linha
          tension: 0.4 // Torna a linha curva em vez de pontiaguda
        }
      ],
      labels: data.map(d => d.date) // Use labels directly (Jan, Feb, Mar, etc)
    };
  });

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // Permite que a div Contentora dite as dimensões e evite que o gráfico cresça infinitamente
    plugins: {
      legend: {
        display: false // Oculta a legenda já que só temos uma linha
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleFont: { size: 13, family: 'Inter, sans-serif' },
        bodyFont: { size: 14, family: 'Inter, sans-serif', weight: 'bold' },
        padding: 12,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: '#f3f4f6' }, // Linhas pontilhadas/suaves horizontais
        border: { dash: [4, 4], display: false }
      },
      x: {
        grid: {
          display: false // Eixo x sem linhas verticais
        }
      }
    }
  };

  onYearChange(year: number) {
    this.selectedYear.set(year);
    this.loadStats();
  }
}

