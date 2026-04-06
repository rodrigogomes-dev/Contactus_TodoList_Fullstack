import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

export const userGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for isInitialized signal to become true
  await firstValueFrom(
    toObservable(auth.isInitialized).pipe(
      filter(initialized => initialized === true)
    )
  );

  // Check if session is valid
  if (!auth.sessionValid()) {
    return router.createUrlTree(['/login']);
  }

  // Se for user, permite a entrada nas rotas de utilizador
  if (auth.role() === 'user') {
    return true;
  }

  // Se for Admin, bloqueia e redireciona para a sua área de administração
  return router.createUrlTree(['/admin/estatisticas']);
};
