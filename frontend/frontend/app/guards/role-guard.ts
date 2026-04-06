import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

export const roleGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // Wait for isInitialized signal to become true
  await firstValueFrom(
    toObservable(auth.isInitialized).pipe(
      filter(initialized => initialized === true)
    )
  );
  
  // Check if session is valid first
  if (!auth.sessionValid()) {
    return router.createUrlTree(['/login']);
  }
  
  // Now check if user is admin
  if (auth.role() === 'admin') {
    return true;
  }
  
  // Not admin, deny access
  return router.createUrlTree(['/tarefas-abertas']);
};

