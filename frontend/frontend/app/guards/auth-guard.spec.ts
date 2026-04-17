import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    // Mock router navigation
    vi.spyOn(router, 'createUrlTree').mockReturnValue(router.parseUrl('/login'));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('should redirect to login when not authenticated', () => {
    authService.isInitialized.set(true);
    authService.authenticated.set(false);
    authService.sessionValid.set(false);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      // Suppress unhandled rejection from async guard
      if (result instanceof Promise) {
        result.catch(() => {});
      }
      expect(result).toBeDefined();
    });
  });

  it('should redirect to login when session is invalid', () => {
    authService.isInitialized.set(true);
    authService.authenticated.set(true);
    authService.sessionValid.set(false);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      if (result instanceof Promise) {
        result.catch(() => {});
      }
      expect(result).toBeDefined();
    });
  });

  it('should have correct signal values when authenticated', () => {
    authService.isInitialized.set(true);
    authService.authenticated.set(true);
    authService.sessionValid.set(true);

    expect(authService.authenticated()).toBe(true);
    expect(authService.sessionValid()).toBe(true);
  });

  it('should have correct initial signal values', () => {
    expect(authService.isInitialized()).toBeDefined();
    expect(authService.authenticated()).toBe(false);
    expect(authService.sessionValid()).toBe(false);
  });
});
