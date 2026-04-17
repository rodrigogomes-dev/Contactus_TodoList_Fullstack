import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, of, throwError } from 'rxjs';
import { taskResolver } from './task-resolver';
import { TaskService } from '../services/task';

describe('taskResolver', () => {
  let taskService: TaskService;
  let mockRoute: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });

    taskService = TestBed.inject(TaskService);

    // Mock the route object
    mockRoute = {
      paramMap: {
        get: (key: string) => '1',
      },
    };

    // Spy on taskService methods
    vi.spyOn(taskService, 'getById');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve task by ID', () => {
    const mockTask = {
      id: 1,
      titulo: 'Test Task',
      descricao: 'Test Description',
      estado: 'pendente',
      prioridade: 'alta',
      category_id: 1,
      user_id: 1,
      created_at: '2026-04-17T10:00:00Z',
      updated_at: '2026-04-17T10:00:00Z',
    };

    (taskService.getById as any).mockReturnValue(of(mockTask));

    TestBed.runInInjectionContext(() => {
      const result = taskResolver(mockRoute, {} as any);
      
      if (result instanceof Observable) {
        result.subscribe((task: any) => {
          expect(task).toEqual(mockTask);
          expect(taskService.getById).toHaveBeenCalledWith(1);
        });
      }
    });
  });

  it('should extract numeric ID from route params', () => {
    mockRoute.paramMap.get = vi.fn((key: string) => (key === 'id' ? '42' : null));

    TestBed.runInInjectionContext(() => {
      const result = taskResolver(mockRoute, {} as any);
      
      if (result instanceof Observable) {
        (taskService.getById as any).mockReturnValue(of({}));
        result.subscribe();
      }
    });

    expect(mockRoute.paramMap.get).toHaveBeenCalledWith('id');
  });

  it('should handle 404 error when task not found', () => {
    const error404 = { status: 404, message: 'Not found' };

    (taskService.getById as any).mockReturnValue(throwError(() => error404));

    TestBed.runInInjectionContext(() => {
      const result = taskResolver(mockRoute, {} as any);
      
      if (result instanceof Observable) {
        result.subscribe({
          error: (error) => {
            expect(error.status).toBe(404);
          },
        });
      }
    });
  });

  it('should call getById with correct task ID', () => {
    mockRoute.paramMap.get = vi.fn((key: string) => (key === 'id' ? '123' : null));

    (taskService.getById as any).mockReturnValue(of({ id: 123 }));

    TestBed.runInInjectionContext(() => {
      const result = taskResolver(mockRoute, {} as any);
      
      if (result instanceof Observable) {
        result.subscribe();
      }
    });

    expect(taskService.getById).toHaveBeenCalledWith(123);
  });
});
