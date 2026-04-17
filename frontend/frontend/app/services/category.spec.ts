import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category';
import { environment } from '../../environments/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService],
    });

    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should fetch categories from API', (context) => {
    return new Promise<void>((resolve) => {
      const mockResponse = {
        data: [
          { id: 1, nome: 'Work', cor: '#FF0000', created_at: '2026-04-17T10:00:00Z', updated_at: '2026-04-17T10:00:00Z' },
          { id: 2, nome: 'Personal', cor: '#00FF00', created_at: '2026-04-17T10:00:00Z', updated_at: '2026-04-17T10:00:00Z' },
        ],
      };

      service.getCategories().subscribe({
        next: (categories) => {
          expect(categories.length).toBe(2);
          expect(categories[0].nome).toBe('Work');
          expect(categories[1].nome).toBe('Personal');
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/categories`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  it('should update categories signal when fetching', (context) => {
    return new Promise<void>((resolve) => {
      const mockResponse = {
        data: [
          { id: 1, nome: 'Work', cor: '#FF0000', created_at: '2026-04-17T10:00:00Z', updated_at: '2026-04-17T10:00:00Z' },
        ],
      };

      service.getCategories().subscribe({
        next: () => {
          const categoriesSignal = service.getCategoriesSignal();
          expect(categoriesSignal().length).toBe(1);
          expect(categoriesSignal()[0].nome).toBe('Work');
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/categories`);
      req.flush(mockResponse);
    });
  });

  it('should add new category', (context) => {
    return new Promise<void>((resolve) => {
      const newCategory = { nome: 'Shopping', cor: '#0000FF' };
      const mockResponse = {
        id: 3,
        nome: 'Shopping',
        cor: '#0000FF',
        created_at: '2026-04-17T10:00:00Z',
        updated_at: '2026-04-17T10:00:00Z',
      };

      service.addCategory(newCategory).subscribe({
        next: (createdCategory) => {
          expect(createdCategory.id).toBe(3);
          expect(createdCategory.nome).toBe('Shopping');
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/categories`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newCategory);
      req.flush(mockResponse);
    });
  });

  it('should handle empty categories response', (context) => {
    return new Promise<void>((resolve) => {
      const mockResponse = { data: [] };

      service.getCategories().subscribe({
        next: (categories) => {
          expect(categories.length).toBe(0);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/categories`);
      req.flush(mockResponse);
    });
  });

  it('should handle API error gracefully', (context) => {
    return new Promise<void>((resolve) => {
      service.getCategories().subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/categories`);
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  it('should handle 401 Unauthorized error', (context) => {
    return new Promise<void>((resolve) => {
      service.getCategories().subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/categories`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
