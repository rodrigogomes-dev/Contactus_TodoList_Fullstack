import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

/**
 * Guard: userGuard
 * Proteção de rotas que requerem não ser administrador.
 * Bloqueia admins de acederem ás páginas de utilizador comum.
 * 
 * Fluxo:
 *  1. Esperar inicialização de auth
 *  2. Verificar se sessionValid = true
 *  3. Verificar se role = 'user' (não admin)
 *  4. Se user, permitir; se admin, redirecionar para admin stats
 * 
 * Usado em: Rotas de utilizadores normais (tarefas, perfil, etc)
 */
export const userGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Aguardar que auth seja inicializada
  await firstValueFrom(
    toObservable(auth.isInitialized).pipe(
      filter(initialized => initialized === true)
    )
  );

  // Verificar se sessão é válida
  if (!auth.sessionValid()) {
    return router.createUrlTree(['/login']);           // Não autenticado → login
  }

  // Verificar se é utilizador comum (não admin)
  if (auth.role() === 'user') {
    return true;                                        // ✅ User → permitir
  }

  // Utilizador é admin, redirecionar para área de admin
  return router.createUrlTree(['/admin/estatisticas']);  // ❌ Admin → redirecionar
};
