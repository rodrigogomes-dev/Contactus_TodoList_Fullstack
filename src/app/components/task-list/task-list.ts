import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TaskService, Tarefa } from '../../services/task';
import { HasUnsavedChanges } from '../../guards/save-guard';
import { TaskformComponent } from '../taskform/taskform';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, TaskformComponent],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskListComponent implements HasUnsavedChanges {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);

  tasks = this.taskService.getTasksSignal();

  selectedTask = signal<Tarefa | null>(null);
  currentView = signal<'pendente' | 'concluido'>('pendente');
  showModal = signal<boolean>(false);
  editingTask = signal<Tarefa | null>(null);
  isDirty = false;

  // Filtros
  searchQuery = signal<string>('');
  priorityFilter = signal<string>('todas');
  categoryFilter = signal<number | 'todas'>('todas');

  // Categorias únicas (baseado nos IDs porque o mock não tem nomes de categorias reais)
  categories = computed(() => {
    const cats = this.tasks().map(t => t.id_categoria).filter(c => c !== null);
    return [...new Set(cats)];
  });

  filteredTasks = computed(() => {
    let result = this.tasks().filter(task => task.estado === this.currentView());

    if (this.searchQuery().trim() !== '') {
      const q = this.searchQuery().toLowerCase();
      result = result.filter(t => t.titulo.toLowerCase().includes(q) || t.descricao?.toLowerCase().includes(q));
    }

    if (this.priorityFilter() !== 'todas') {
      result = result.filter(t => t.prioridade === this.priorityFilter());
    }

    if (this.categoryFilter() !== 'todas') {
      result = result.filter(t => t.id_categoria === Number(this.categoryFilter()));
    }

    return result;
  });

  // Paginação
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(4);

  totalFiltered = computed(() => this.filteredTasks().length);
  totalPages = computed(() => Math.ceil(this.totalFiltered() / this.itemsPerPage()) || 1);

  paginatedTasks = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredTasks().slice(start, end);
  });

  totalConcluidas = computed(() =>
    this.tasks().filter(task => task.estado === 'concluido').length
  );

  percentualConcluido = computed(() => {
    const total = this.tasks().length;
    return total === 0 ? 0 : Math.round((this.totalConcluidas() / total) * 100);
  });

  constructor() {
    effect(() => {
      this.route.data.subscribe(data => {
        const view = data['view'];
        if (view) {
          this.currentView.set(view);
          this.currentPage.set(1); // Reset de página na mudança de view
        }
      });
    });
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id);
  }

  toggleStatus(id: number) {
    const task = this.taskService.getTasksSignal()().find(t => t.id === id);
    if (task) {
      this.taskService.updateTask({ ...task, estado: task.estado === 'pendente' ? 'concluido' : 'pendente' });
    }
  }

  selectTask(task: Tarefa) {
    this.selectedTask.set(this.selectedTask() === task ? null : task);
  }

  openModal() {
    this.editingTask.set(null);
    this.showModal.set(true);
  }

  openEditModal(task: Tarefa) {
    this.editingTask.set(task);
    this.showModal.set(true);
  }

  onModalClose() {
    this.showModal.set(false);
  }

  // Handlers para os filtros
  onSearchChange(val: string) {
    this.searchQuery.set(val);
    this.currentPage.set(1);
  }

  onPriorityChange(val: string) {
    this.priorityFilter.set(val);
    this.currentPage.set(1);
  }

  onCategoryChange(val: string | number) {
    this.categoryFilter.set(val === 'todas' ? 'todas' : Number(val));
    this.currentPage.set(1);
  }

  // Handlers navegação da paginação
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
