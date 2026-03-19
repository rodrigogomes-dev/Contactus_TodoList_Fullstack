import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TaskService, Tarefa } from '../../services/task';
import { HasUnsavedChanges } from '../../guards/save-guard';
import { TaskformComponent } from '../taskform/taskform';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, DatePipe, TaskformComponent],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskListComponent implements HasUnsavedChanges {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);

  tasks = this.taskService.getTasks();
  selectedTask = signal<Tarefa | null>(null);
  currentView = signal<'pendente' | 'concluido'>('pendente');
  showModal = signal<boolean>(false);
  editingTask = signal<Tarefa | null>(null);
  isDirty = false;

  filteredTasks = computed(() =>
    this.tasks().filter(task => task.estado === this.currentView())
  );

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
        if (view) this.currentView.set(view);
      });
    });
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id);
  }

  toggleStatus(id: number) {
    const task = this.tasks().find(task => task.id === id);
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
}
