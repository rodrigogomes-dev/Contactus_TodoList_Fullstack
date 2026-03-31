import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

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
export class Statistics {
  period = signal<'ultimo-mes' | 'ano-2026' | 'tudo'>('ultimo-mes');

  // Dados simulados de novas inscrições na plataforma (Mock)
  mockData: UserStats[] = [
    { date: '2025-11-15', count: 12 },
    { date: '2025-12-05', count: 8 },
    { date: '2025-12-20', count: 25 },
    { date: '2026-01-10', count: 15 },
    { date: '2026-01-22', count: 30 },
    { date: '2026-02-05', count: 18 },
    { date: '2026-02-14', count: 42 },
    { date: '2026-02-28', count: 20 },
    // "Último mês" relativo a Março/Abril 2026
    { date: '2026-03-01', count: 5 },
    { date: '2026-03-05', count: 14 },
    { date: '2026-03-10', count: 22 },
    { date: '2026-03-15', count: 35 },
    { date: '2026-03-20', count: 19 },
    { date: '2026-03-25', count: 40 },
    { date: '2026-03-29', count: 55 },
    { date: '2026-03-31', count: 62 },
  ];

  // Filtramos os dados reativamente
  filteredData = computed(() => {
    // Usamos uma data fixa para simular o "Hoje" caso o projeto seja visto noutras datas.
    // Assim o filtro de 'Último Mês' tem sempre dados no nosso mock.
    const today = new Date('2026-03-31'); 
    let result = this.mockData;

    if (this.period() === 'ultimo-mes') {
      const oneMonthAgo = new Date(today);
      oneMonthAgo.setMonth(today.getMonth() - 1);
      result = result.filter(d => new Date(d.date) >= oneMonthAgo);
    } else if (this.period() === 'ano-2026') {
      result = result.filter(d => d.date.startsWith('2026'));
    }

    // Ordenar por data cronológicamente
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
      labels: data.map(d => {
        // Formata as labels de data do eixo-x (ex: "15 Mar")
        const dateObj = new Date(d.date);
        return dateObj.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
      })
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

  onPeriodChange(val: string) {
    this.period.set(val as any);
  }
}
