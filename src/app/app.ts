import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService, Tarefa} from './services/task';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  private taskService = inject(TaskService);
  tasks = signal<Tarefa[]>([]);
  editingTask = signal<Tarefa | null>(null);
  selectedTask = signal<Tarefa | null>(null);
  tarefaEditada = signal<Tarefa | null>(null);

  novoTitulo: string = '';

  constructor() {
    this.tasks.set(this.taskService.getTasks());
  }

  addTask() {
    if (this.novoTitulo.trim() !== '') {
      const maxId = this.tasks().reduce((max, task) => task.id > max ? task.id : max, 0);
      const newTask: Tarefa = {
        id: maxId + 1,
        id_utilizador: 1, // default user id
        titulo: this.novoTitulo,
        descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl eu nisl.',
        estado: 'pendente',
        prioridade: 'media',
        data_vencimento: null,
        data_criacao: new Date(),
        id_categoria: 1, // default category
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
    if (this.editingTask() && this.tarefaEditada() && this.tarefaEditada()!.titulo.trim() !== '') {
      this.taskService.updateTask(this.tarefaEditada()!);
      this.tasks.set(this.taskService.getTasks());
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingTask.set(null);
    this.tarefaEditada.set(null);
  }

  updateDueDate(dateString: string) {
    if (this.tarefaEditada()) {
      const newDate = dateString ? new Date(dateString + 'T00:00:00') : null;
      this.tarefaEditada.set({
        ...this.tarefaEditada()!,
        data_vencimento: newDate,
      });
    }
  }

  updateEstado(estado: string) {
    this.tarefaEditada.update(task => {
      if (!task) return null;
      return { ...task, estado: estado as 'pendente' | 'concluido' };
    });
  }

  updatePrioridade(prioridade: string) {
    this.tarefaEditada.update(task => {
      if (!task) return null;
      return { ...task, prioridade: prioridade as 'baixa' | 'media' | 'alta' };
    });
  }
}
