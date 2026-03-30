import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const userGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Se for user, permite a entrada nas rotas de utilizador
  if (auth.role() === 'user') return true;

  // Se for Admin, bloqueia e redireciona para a sua área de administração
  return router.createUrlTree(['/admin/estatisticas']);
};
