import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TaskService, Tarefa } from '../../services/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, UpperCasePipe],
  templateUrl: './task-list.html',
  styleUrls: ['./task-list.css']
})
export class TaskListComponent {
  // 🔑 Lê os parâmetros da rota (data: { view })
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);

  // 📋 Signals
  tasks = signal<Tarefa[]>([]);
  editingTask = signal<Tarefa | null>(null);
  selectedTask = signal<Tarefa | null>(null);
  tarefaEditada = signal<Tarefa | null>(null);
  currentView = signal<'pendente' | 'concluido'>('pendente');
  
  // 📝 State simples (não signal)
  novoTitulo: string = '';

  // 🧮 Computed signals (derivados)
  filteredTasks = computed(() => {
    const view = this.currentView();
    return this.tasks().filter(task => task.estado === view);
  });

  totalPendentes = computed(() => {
    return this.tasks().filter(task => task.estado === 'pendente').length;
  });

  totalConcluidas = computed(() => {
    return this.tasks().filter(task => task.estado === 'concluido').length;
  });

  percentualConcluido = computed(() => {
    const total = this.tasks().length;
    if (total === 0) return 0;
    return Math.round((this.totalConcluidas() / total) * 100);
  });

  constructor() {
  // ✅ Carrega tarefas iniciais
  this.tasks.set(this.taskService.getTasks());

  // 🔍 ESTE EFFECT É A CHAVE DO ROUTING
  // Sempre que a rota muda, currentView é atualizado
  effect(() => {
    this.route.data.subscribe(data => {
      const view = data['view'];  // ✅ Usar 'data' aqui, não 'this.route.data'
      if (view) {
        this.currentView.set(view);
      }
    });
  });  // ✅ Fechar com }); em vez de );
}

  addTask() {
    if (this.novoTitulo.trim() !== '') {
      const maxId = this.tasks().reduce((max, task) => task.id > max ? task.id : max, 0);
      const newTask: Tarefa = {
        id: maxId + 1,
        id_utilizador: 1,
        titulo: this.novoTitulo,
        descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        estado: 'pendente',
        prioridade: 'media',
        data_vencimento: null,
        data_criacao: new Date(),
        id_categoria: 1,
      };
      this.taskService.addTask(newTask);
      this.tasks.set(this.taskService.getTasks());
      this.novoTitulo = '';
    }
  }

  deleteTask(id: number) {
    this.taskService.deleteTask(id);
    this.tasks.set(this.taskService.getTasks());
  }

  toggleStatus(id: number) {
    const task = this.tasks().find(task => task.id === id);
    if (task) {
      const newEstado: Tarefa['estado'] = task.estado === 'pendente' ? 'concluido' : 'pendente';
      const updatedTask: Tarefa = { ...task, estado: newEstado };
      this.taskService.updateTask(updatedTask);
      this.tasks.set(this.taskService.getTasks());
    }
  }

  selectTask(task: Tarefa) {
    if (this.selectedTask() === task) {
      this.selectedTask.set(null);
    } else {
      this.selectedTask.set(task);
    }
  }

  editTask(task: Tarefa) {
    this.editingTask.set(task);
    this.tarefaEditada.set({ ...task });
  }

  saveTask() {
    if (this.tarefaEditada()) {
      this.taskService.updateTask(this.tarefaEditada()!);
      this.tasks.set(this.taskService.getTasks());
      this.editingTask.set(null);
      this.selectedTask.set(null);
    }
  }

  cancelEdit() {
    this.editingTask.set(null);
    this.tarefaEditada.set(null);
  }

  updateEstado(event: string) {
    if (this.tarefaEditada()) {
      this.tarefaEditada.update(task => ({ ...task!, estado: event as Tarefa['estado'] }));
    }
  }

  updatePrioridade(event: string) {
    if (this.tarefaEditada()) {
      this.tarefaEditada.update(task => ({ ...task!, prioridade: event as Tarefa['prioridade'] }));
    }
  }

  updateDueDate(event: string) {
    if (this.tarefaEditada()) {
      this.tarefaEditada.update(task => ({ ...task!, data_vencimento: event ? new Date(event) : null }));
    }
  }
}
