import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';
import { signal } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should login with valid credentials', (context) => {
    return new Promise<void>((resolve) => {
      const loginPayload = { email: 'user@example.com', password: 'password123' };
      const mockResponse = {
        token: 'test-token-123',
        user: { id: 1, name: 'Test User', email: 'user@example.com', is_admin: 0 },
      };

      service.login(loginPayload).subscribe({
        next: (response) => {
          expect(response.token).toBe('test-token-123');
          expect(service.authenticated()).toBe(true);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginPayload);
      req.flush(mockResponse);
    });
  });

  it('should register new user', (context) => {
    return new Promise<void>((resolve) => {
      const registerPayload = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      };
      const mockResponse = {
        token: 'new-token-456',
        user: { id: 2, name: 'New User', email: 'newuser@example.com', is_admin: 0 },
      };

      service.register(registerPayload).subscribe({
        next: (response) => {
          expect(response.token).toBe('new-token-456');
          expect(service.authenticated()).toBe(true);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  it('should logout user', (context) => {
    return new Promise<void>((resolve) => {
      // First set authenticated state
      service.login({ email: 'user@example.com', password: 'password' }).subscribe({
        next: () => {
          service.logout().subscribe({
            next: () => {
              expect(service.authenticated()).toBe(false);
              expect(service.sessionValid()).toBe(false);
              resolve();
            },
          });

          const logoutReq = httpMock.expectOne(`${apiUrl}/logout`);
          logoutReq.flush({ message: 'Logged out successfully' });
        },
      });

      const loginReq = httpMock.expectOne(`${apiUrl}/login`);
      loginReq.flush({
        token: 'test-token',
        user: { id: 1, name: 'Test User', email: 'user@example.com', is_admin: 0 },
      });
    });
  });

  it('should get current user (getMe)', (context) => {
    return new Promise<void>((resolve) => {
      const mockUser = { id: 1, name: 'Test User', email: 'user@example.com', is_admin: 0 };

      service.getMe().subscribe({
        next: (user) => {
          expect(user).toEqual(mockUser);
          expect(service.currentUser()).toEqual(mockUser);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/me`);
      req.flush({ user: mockUser });
    });
  });

  it('should set role to admin for admin users', (context) => {
    return new Promise<void>((resolve) => {
      const mockAdmin = { id: 1, name: 'Admin User', email: 'admin@example.com', is_admin: 1 };

      service.getMe().subscribe({
        next: () => {
          expect(service.role()).toBe('admin');
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/me`);
      req.flush({ user: mockAdmin });
    });
  });

  it('should set role to user for non-admin users', (context) => {
    return new Promise<void>((resolve) => {
      const mockUser = { id: 1, name: 'Test User', email: 'user@example.com', is_admin: 0 };

      service.getMe().subscribe({
        next: () => {
          expect(service.role()).toBe('user');
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/me`);
      req.flush({ user: mockUser });
    });
  });

  it('should handle login error gracefully', (context) => {
    return new Promise<void>((resolve) => {
      service.login({ email: 'user@example.com', password: 'wrongpassword' }).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  it('should update username signal when logging in', (context) => {
    return new Promise<void>((resolve) => {
      service.login({ email: 'user@example.com', password: 'password' }).subscribe({
        next: () => {
          // Username signal should be updated from getMe call
          expect(service.username()).toBeTruthy();
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush({
        token: 'test-token',
        user: { id: 1, name: 'Test User', email: 'user@example.com', is_admin: 0 },
      });
    });
  });

  it('should store token in localStorage', (context) => {
    return new Promise<void>((resolve) => {
      service.login({ email: 'user@example.com', password: 'password' }).subscribe({
        next: () => {
          expect(localStorage.getItem('auth_token')).toBe('test-token');
          resolve();
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/login`);
      req.flush({
        token: 'test-token',
        user: { id: 1, name: 'Test User', email: 'user@example.com', is_admin: 0 },
      });
    });
  });
});
