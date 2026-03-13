import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  name: string;
  status: 'open' | 'completed';
  priority: 'low' | 'medium' | 'high'; 
}

@Component({
  selector: 'app-root',
  standalone: true,            // <-- Isto é o que o torna um componente standalone
  imports: [FormsModule],        // <-- Isto permite usar o ngModel no template
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App { // <-- A classe que está a ser exportada
  tasks = signal<Task[]>([
    { id: 1, name: 'Estudar o novo Control Flow do Angular', status: 'completed', priority: 'high' },
    { id: 2, name: 'Implementar o @for com a cláusula track', status: 'open', priority: 'high' },
    { id: 3, name: 'Verificar a renderização condicional com @if', status: 'open', priority: 'medium' },
    { id: 4, name: 'Analisar Class Binding para prioridades', status: 'open', priority: 'low' },
  ]);

  newTask: string = '';
  editingTask = signal<Task | null>(null);
  editedTaskName: string = '';

  addTask() {
    if (this.newTask.trim() !== '') {
      const newTask: Task = {
        id: Date.now(),
        name: this.newTask,
        status: 'open',
        priority: 'low',
      };
      this.tasks.update(tasks => [...tasks, newTask]);
      this.newTask = '';
    }
  }

  deleteTask(id: number) {
    this.tasks.update(tasks => tasks.filter((task: Task) => task.id !== id));
  }

  toggleStatus(id: number) {
    this.tasks.update(tasks =>
      tasks.map((task: Task) =>
        task.id === id ? { ...task, status: task.status === 'open' ? 'completed' : 'open'} : task
      )
    );
  }

  editTask(task: Task) {
    this.editingTask.set(task);
    this.editedTaskName = task.name;
  }

  saveTask() {
    if (this.editingTask()) {
      this.tasks.update(tasks =>
        tasks.map((task: Task) =>
          task.id === this.editingTask()!.id ? { ...task, name: this.editedTaskName } : task
        )
      );
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingTask.set(null);
    this.editedTaskName = '';
  }
}