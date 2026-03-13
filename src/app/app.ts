import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  name: string;
  completed: boolean;
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
    { id: 1, name: 'Aprender Angular', completed: true },
    { id: 2, name: 'Criar um To-Do App', completed: false },
    { id: 3, name: 'Implementar Signals', completed: false },
  ]);

  newTask: string = '';
  editingTask = signal<Task | null>(null);
  editedTaskName: string = '';

  addTask() {
    if (this.newTask.trim() !== '') {
      const newTask: Task = {
        id: Date.now(),
        name: this.newTask,
        completed: false,
      };
      this.tasks.update(tasks => [...tasks, newTask]);
      this.newTask = '';
    }
  }

  deleteTask(id: number) {
    this.tasks.update(tasks => tasks.filter((task: Task) => task.id !== id));
  }

  toggleComplete(id: number) {
    this.tasks.update(tasks =>
      tasks.map((task: Task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
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