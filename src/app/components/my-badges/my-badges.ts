import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeService } from '../../services/badge';

@Component({
  selector: 'app-my-badges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-badges.html',
  styleUrl: './my-badges.css',
})
export class MyBadges {
  private badgeService = inject(BadgeService);

  badges = this.badgeService.getBadgesSignal();

  // Filtros
  statusFilter = signal<'todas' | 'obtidas' | 'nao-obtidas'>('todas');
  categoryFilter = signal<string>('todas');
  milestoneFilter = signal<string>('todos');

  // Paginação
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(8);

  // Lista de categorias únicas (extraída dos dados)
  categories = computed(() => {
    const cats = this.badges().map(b => b.categoria);
    return [...new Set(cats)];
  });

  // Lista de níveis únicos (extraída dos dados)
  milestones = computed(() => {
    const miles = this.badges().map(b => b.milestone);
    return [...new Set(miles)];
  });

  // Badges filtradas
  filteredBadges = computed(() => {
    let result = this.badges();

    if (this.statusFilter() === 'obtidas') {
      result = result.filter(b => b.unlocked);
    } else if (this.statusFilter() === 'nao-obtidas') {
      result = result.filter(b => !b.unlocked);
    }

    if (this.categoryFilter() !== 'todas') {
      result = result.filter(b => b.categoria === this.categoryFilter());
    }

    // Filtro por nível (milestone)
    if (this.milestoneFilter() !== 'todos') {
      result = result.filter(b => b.milestone === this.milestoneFilter());
    }

    return result;
  });

  // Stats (sempre baseadas em TODAS as badges, não nas filtradas)
  totalBadges = computed(() => this.badges().length);
  unlockedBadges = computed(() => this.badges().filter(b => b.unlocked).length);
  lockedBadges = computed(() => this.badges().filter(b => !b.unlocked).length);

  // Dados da Paginação
  totalFiltered = computed(() => this.filteredBadges().length);
  totalPages = computed(() => Math.ceil(this.totalFiltered() / this.itemsPerPage()) || 1);

  paginatedBadges = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredBadges().slice(start, end);
  });

  onStatusChange(value: string) {
    this.statusFilter.set(value as 'todas' | 'obtidas' | 'nao-obtidas');
    this.currentPage.set(1);
  }

  onCategoryChange(value: string) {
    this.categoryFilter.set(value);
    this.currentPage.set(1);
  }

  onMilestoneChange(value: string) {
    this.milestoneFilter.set(value);
    this.currentPage.set(1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }
}
