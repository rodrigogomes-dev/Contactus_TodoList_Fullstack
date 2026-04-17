import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task';
import { environment } from '../../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should fetch tasks from API', (context) => {
    return new Promise<void>((resolve) => {
      const mockResponse = {
        data: [
          {
            id: 1,
            titulo: 'Test Task',
            descricao: 'Test Description',
            estado: 'pendente',
            prioridade: 'alta',
            category_id: 1,
            user_id: 1,
            created_at: '2026-04-17T10:00:00Z',
            updated_at: '2026-04-17T10:00:00Z',
          },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
      };

      service.getTasks().subscribe({
        next: (tasks) => {
          expect(tasks.length).toBeGreaterThan(0);
          expect(tasks[0].titulo).toBe('Test Task');
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/tasks`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  it('should update tasks signal when fetching', (context) => {
    return new Promise<void>((resolve) => {
      const mockResponse = {
        data: [
          {
            id: 1,
            titulo: 'Test Task',
            descricao: 'Test Description',
            estado: 'pendente',
            prioridade: 'alta',
            category_id: 1,
            user_id: 1,
            created_at: '2026-04-17T10:00:00Z',
            updated_at: '2026-04-17T10:00:00Z',
          },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
      };

      service.getTasks().subscribe({
        next: () => {
          const tasksSignal = service.getTasksSignal();
          expect(tasksSignal().length).toBe(1);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/tasks`);
      req.flush(mockResponse);
    });
  });

  it('should get tasks signal', () => {
    const tasksSignal = service.getTasksSignal();
    expect(tasksSignal).toBeDefined();
    // Initial state should be empty array
    expect(tasksSignal().length).toBe(0);
  });

  it('should handle empty tasks response', (context) => {
    return new Promise<void>((resolve) => {
      const mockResponse = {
        data: [],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
      };

      service.getTasks().subscribe({
        next: (tasks) => {
          expect(tasks.length).toBe(0);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/tasks`);
      req.flush(mockResponse);
    });
  });

  it('should handle API error gracefully', (context) => {
    return new Promise<void>((resolve) => {
      service.getTasks().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/tasks`);
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  it('should filter tasks by status when needed', (context) => {
    return new Promise<void>((resolve) => {
      const mockResponse = {
        data: [
          {
            id: 1,
            titulo: 'Pending Task',
            descricao: 'A pending task',
            estado: 'pendente',
            prioridade: 'alta',
            category_id: 1,
            user_id: 1,
            created_at: '2026-04-17T10:00:00Z',
            updated_at: '2026-04-17T10:00:00Z',
          },
          {
            id: 2,
            titulo: 'Completed Task',
            descricao: 'A completed task',
            estado: 'concluido',
            prioridade: 'baixa',
            category_id: 1,
            user_id: 1,
            created_at: '2026-04-17T09:00:00Z',
            updated_at: '2026-04-17T10:00:00Z',
          },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 2,
      };

      service.getTasks().subscribe({
        next: (tasks) => {
          const pendingTasks = tasks.filter((t) => t.estado === 'pendente');
          expect(pendingTasks.length).toBe(1);
          expect(pendingTasks[0].titulo).toBe('Pending Task');
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/tasks`);
      req.flush(mockResponse);
    });
  });

  it('should map API response to frontend format', (context) => {
    return new Promise<void>((resolve) => {
      const mockResponse = {
        data: [
          {
            id: 1,
            titulo: 'Test Task',
            descricao: 'Description',
            estado: 'pendente',
            prioridade: 'alta',
            category_id: 1,
            user_id: 1,
            created_at: '2026-04-17T10:00:00Z',
            updated_at: '2026-04-17T10:00:00Z',
          },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 1,
      };

      service.getTasks().subscribe({
        next: (tasks) => {
          // Check that mapping occurred (frontend format differs from API)
          expect(tasks[0]).toBeDefined();
          expect(tasks[0].id).toBe(1);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/tasks`);
      req.flush(mockResponse);
    });
  });

  it('should handle pagination in response', (context) => {
    return new Promise<void>((resolve) => {
      const mockResponse = {
        data: [
          {
            id: 1,
            titulo: 'Task 1',
            descricao: 'Description 1',
            estado: 'pendente',
            prioridade: 'alta',
            category_id: 1,
            user_id: 1,
            created_at: '2026-04-17T10:00:00Z',
            updated_at: '2026-04-17T10:00:00Z',
          },
        ],
        current_page: 1,
        last_page: 3,
        per_page: 15,
        total: 45,
      };

      service.getTasks().subscribe({
        next: (tasks) => {
          expect(tasks.length).toBe(1);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/tasks`);
      req.flush(mockResponse);
    });
  });

  it('should handle 401 Unauthorized error', (context) => {
    return new Promise<void>((resolve) => {
      service.getTasks().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/tasks`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
