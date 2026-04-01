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
  private http = inject(HttpClient);

  // Signal to store all user's tasks
  private tarefas = signal<Tarefa[]>([]);

  // Loading state for UI indicators
  private isLoading = signal(false);

  /**
   * Fetch all tasks for current user from API
   * GET /api/tasks - returns paginated response
   * Updates the tarefas signal with fetched data
   */
  getTasks(): Observable<Tarefa[]> {
    this.isLoading.set(true);
    return this.http.get<TasksPaginatedResponse>(`${environment.apiUrl}/tasks`).pipe(
      map((response) => {
        // Map API responses to frontend format
        const mappedTasks = mapApiTasksToFrontend(response.data);
        // Update signal
        this.tarefas.set(mappedTasks);
        // Return mapped tasks
        return mappedTasks;
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  /**
   * Get the reactive signal accessor for tasks
   * Use this for template binding and reactive updates
   */
  getTasksSignal() {
    return this.tarefas;
  }

  /**
   * Create a new task via POST /api/tasks
   * Removes id since server will assign it
   * Normalizes frontend values to API format
   */
  addTask(task: Omit<Tarefa, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Observable<TaskApiResponse> {
    // Convert frontend task to API format expected by backend
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
        // Map response to frontend format and add to signal
        const newTask = mapApiTaskToFrontend(apiResponse);
        this.tarefas.update((list) => [...list, newTask]);
      })
    );
  }

  /**
   * Update existing task via PUT /api/tasks/{id}
   * Normalizes frontend values to API format
   */
  updateTask(task: Tarefa): Observable<TaskApiResponse> {
    const { id, ...updateData } = task;

    // Convert to API format (excluding id, createdAt, updatedAt, userId)
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
        // Map response to frontend format and update signal
        const updatedTask = mapApiTaskToFrontend(apiResponse);
        this.tarefas.update((list) =>
          list.map((t) => (t.id === updatedTask.id ? updatedTask : t))
        );
      })
    );
  }

  /**
   * Delete task via DELETE /api/tasks/{id}
   * Updates signal to remove deleted task
   */
  deleteTask(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/tasks/${id}`).pipe(
      tap(() => {
        // Remove from signal
        this.tarefas.update((list) => list.filter((task) => task.id !== id));
      })
    );
  }

  /**
   * Get single task by ID
   * Used by route resolver when user navigates to task details
   */
  getById(id: number): Observable<TaskApiResponse> {
    return this.http
      .get<TaskApiEnvelope>(`${environment.apiUrl}/tasks/${id}`)
      .pipe(map((response) => this.extractTaskPayload(response)));
  }

  /**
   * Get loading state signal
   */
  getLoadingState() {
    return this.isLoading;
  }

  private extractTaskPayload(response: TaskApiEnvelope): TaskApiResponse {
    if ('data' in response) {
      return response.data;
    }

    if ('task' in response) {
      return response.task;
    }

    return response;
  }
}
