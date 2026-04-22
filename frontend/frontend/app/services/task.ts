import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Tarefa,
  TaskApiResponse,
  TasksPaginatedResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  mapApiTaskToFrontend,
  mapApiTasksToFrontend,
  TaskStateApi,
  TaskPriorityApi,
} from '../types/task';

type TaskApiEnvelope =
  | TaskApiResponse
  | { data: TaskApiResponse }
  | { task: TaskApiResponse };

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  /**
   * Injeção de dependência
   */
  private http = inject(HttpClient);

  /**
   * Signal: Lista de tarefas do utilizador atual.
   * Atualiza automaticamente quando tarefas são criadas/atualizadas/deletadas.
   * Componentes usam getTasksSignal() para acesso reativo.
   */
  private tarefas = signal<Tarefa[]>([]);

  /**
   * Signal: Estado de carregamento.
   * true = HTTP request em progresso
   * false = request completo
   * Usado para UI spinners/loaders
   */
  private isLoading = signal(false);

  /**
   * Endpoint: GET /api/tasks
   * Obter todas as tarefas do utilizador atual (paginado).
   * 
   * Fluxo:
   *  1. Marcar isLoading = true
   *  2. Fazer request GET
   *  3. Map: converter resposta API para frontend format
   *  4. Update signal tarefas
   *  5. Finalize: marcar isLoading = false
   */
  getTasks(): Observable<Tarefa[]> {
    this.isLoading.set(true);
    return this.http.get<TasksPaginatedResponse>(`${environment.apiUrl}/tasks`).pipe(
      map((response) => {
        // Converter resposta API para modelo frontend
        const mappedTasks = mapApiTasksToFrontend(response.data);
        // Atualizar signal com novas tarefas
        this.tarefas.set(mappedTasks);
        // Retornar para componente
        return mappedTasks;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Obter acesso ao signal reativo de tarefas.
   * Usado em componentes: tasks$ = taskService.getTasksSignal()
   * Permite reatividade sem subscrever manualmente
   */
  getTasksSignal() {
    return this.tarefas;
  }

  /**
   * Endpoint: POST /api/tasks
   * Criar nova tarefa.
   * 
   * Fluxo:
   *  1. Converter modelo frontend para formato API
   *  2. POST ao backend
   *  3. Map: extrair payload da resposta
   *  4. Tap: converter para frontend e adicionar ao signal
   */
  addTask(task: Omit<Tarefa, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Observable<TaskApiResponse> {
    // Converter tarefa frontend para formato esperado pelo backend
    const apiRequest: CreateTaskRequest = {
      titulo: task.titulo,
      descricao: task.descricao,
      estado: task.estado === 'concluido' ? TaskStateApi.COMPLETED : TaskStateApi.PENDING,
      prioridade: task.prioridade === 'media' ? TaskPriorityApi.MEDIUM : task.prioridade,
      data_vencimento: task.dataVencimento || undefined,
      category_id: Number(task.categoryId),
    };

    return this.http.post<TaskApiEnvelope>(`${environment.apiUrl}/tasks`, apiRequest).pipe(
      map((response) => this.extractTaskPayload(response)),
      tap((apiResponse) => {
        // Converter resposta para frontend format
        const newTask = mapApiTaskToFrontend(apiResponse);
        // Adicionar nova tarefa ao signal (reatividade)
        this.tarefas.update((list) => [...list, newTask]);
      })
    );
  }

  /**
   * Endpoint: PUT /api/tasks/{id}
   * Atualizar tarefa existente.
   * 
   * Fluxo:
   *  1. Converter para formato API
   *  2. PUT ao backend com ID na rota
   *  3. Map: extrair payload
   *  4. Tap: atualizar signal (encontrar por ID e substituir)
   */
  updateTask(task: Tarefa): Observable<TaskApiResponse> {
    const { id, ...updateData } = task;

    // Converter para formato API
    const apiRequest: UpdateTaskRequest = {
      titulo: updateData.titulo,
      descricao: updateData.descricao,
      estado: updateData.estado === 'concluido' ? TaskStateApi.COMPLETED : TaskStateApi.PENDING,
      prioridade: updateData.prioridade === 'media' ? TaskPriorityApi.MEDIUM : updateData.prioridade,
      data_vencimento: updateData.dataVencimento || undefined,
      category_id: updateData.categoryId,
    };

    return this.http.put<TaskApiEnvelope>(`${environment.apiUrl}/tasks/${id}`, apiRequest).pipe(
      map((response) => this.extractTaskPayload(response)),
      tap((apiResponse) => {
        // Converter resposta e atualizar signal
        const updatedTask = mapApiTaskToFrontend(apiResponse);
        this.tarefas.update((list) =>
          list.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
      })
    );
  }

  /**
   * Endpoint: DELETE /api/tasks/{id}
   * Deletar tarefa.
   * 
   * Fluxo:
   *  1. DELETE ao backend
   *  2. Tap: remover de signal (filter por ID)
   *  3. Retorna mensagem de sucesso
   */
  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/tasks/${id}`).pipe(
      tap(() => {
        // Remover tarefa deletada do signal
        this.tarefas.update((list) => list.filter((task) => task.id !== id));
      })
    );
  }

  /**
   * Endpoint: GET /api/tasks/{id}
   * Obter tarefa específica por ID.
   * 
   * Usado por:
   *  - Route resolver: pré-carregar dados antes de navegar
   *  - Componente de detalhe de tarefa
   */
  getById(id: number): Observable<TaskApiResponse> {
    return this.http
      .get<TaskApiEnvelope>(`${environment.apiUrl}/tasks/${id}`)
      .pipe(map((response) => this.extractTaskPayload(response)));
  }

  /**
   * Obter signal de estado de carregamento.
   * Componentes usam para mostrar spinners/loaders durante requests.
   */
  getLoadingState() {
    return this.isLoading;
  }

  /**
   * Helper: Extrair payload da resposta da API.
   * Backend pode retornar { data: {...} } ou { task: {...} } ou diretamente {...}
   * Este método normaliza todos os formatos.
   */
  private extractTaskPayload(response: TaskApiEnvelope): TaskApiResponse {
    if ('data' in response) {
      return response.data;           // Formato paginado: { data: {...} }
    }

    if ('task' in response) {
      return response.task;           // Formato resource: { task: {...} }
    }

    return response;                  // Formato direto: {...}
  }
}
