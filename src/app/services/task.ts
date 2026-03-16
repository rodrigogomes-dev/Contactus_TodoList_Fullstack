import { Injectable } from '@angular/core';

export interface Tarefa {
  id: number;
  id_utilizador: number;
  titulo: string;
  descricao: string | null;
  estado: 'pendente' | 'concluido';
  prioridade: 'baixa' | 'media' | 'alta';
  data_vencimento: Date | null;
  data_criacao: Date;
  id_categoria: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private tarefas: Tarefa[] = [
    { id: 1, id_utilizador: 1, titulo: 'Estudar o novo Control Flow do Angular', descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl eu nisl.', prioridade: 'alta', estado: 'pendente', data_vencimento: new Date('2026-03-20'), data_criacao: new Date(), id_categoria: 1 },
    { id: 2, id_utilizador: 1, titulo: 'Implementar o @for com a cláusula track', descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl eu nisl.', prioridade: 'alta', estado: 'concluido', data_vencimento: null, data_criacao: new Date(), id_categoria: 1 },
    { id: 3, id_utilizador: 1, titulo: 'Verificar a renderização condicional', descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl eu nisl.',  prioridade: 'media', estado: 'pendente', data_vencimento: new Date('2026-03-10'), data_criacao: new Date(), id_categoria: 2 },
    { id: 4, id_utilizador: 1, titulo: 'Analisar Class Binding para prioridades', descricao: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, eget aliquam nisl nisl eu nisl.', prioridade: 'baixa', estado: 'pendente', data_vencimento: null, data_criacao: new Date(), id_categoria: 2 },
  ];

  getTasks(): Tarefa[] {
    return this.tarefas;
  }

  addTask(task: Tarefa) {
    this.tarefas.push(task);
  }

  deleteTask(id: number) {
    this.tarefas = this.tarefas.filter(task => task.id !== id);
  }

  updateTask(updatedTask: Tarefa) {
    const index = this.tarefas.findIndex(task => task.id === updatedTask.id);
    if (index !== -1) {
      this.tarefas[index] = updatedTask;
    }
  }
}

