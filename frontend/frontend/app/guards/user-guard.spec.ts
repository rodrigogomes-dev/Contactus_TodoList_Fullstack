import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { userGuard } from './user-guard';
import { AuthService } from '../services/auth';

describe('userGuard', () => {
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
    vi.spyOn(router, 'createUrlTree').mockReturnValue(router.parseUrl('/admin/estatisticas'));
  });

  it('should allow regular users to access', async () => {
    authService.isInitialized.set(true);
    authService.sessionValid.set(true);
    authService.role.set('user');

    const result = await TestBed.runInInjectionContext(() => userGuard({} as any, {} as any));

    expect(result).toBe(true);
  });

  it('should redirect admin users to admin area', async () => {
    authService.isInitialized.set(true);
    authService.sessionValid.set(true);
    authService.role.set('admin');

    const result = await TestBed.runInInjectionContext(() => userGuard({} as any, {} as any));

    expect(result).toBeDefined();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/estatisticas']);
  });

  it('should redirect to login when session is invalid', async () => {
    authService.isInitialized.set(true);
    authService.sessionValid.set(false);

    vi.spyOn(router, 'createUrlTree').mockReturnValue(router.parseUrl('/login'));

    const result = await TestBed.runInInjectionContext(() => userGuard({} as any, {} as any));

    expect(result).toBeDefined();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
