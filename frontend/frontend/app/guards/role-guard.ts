import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

/**
 * Guard: roleGuard
 * Proteção de rotas que requerem permissão de administrador.
 * 
 * Fluxo:
 *  1. Esperar inicialização de auth
 *  2. Verificar se sessionValid = true
 *  3. Verificar se role = 'admin'
 *  4. Se admin, permitir; senão, redirecionar para tarefas
 * 
 * Usado em: Rotas de admin (stats, categorias, etc)
 */
export const roleGuard: CanActivateFn = async () => {
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
  
  // Verificar se utilizador é admin
  if (auth.role() === 'admin') {
    return true;                                        // ✅ Admin → permitir
  }
  
  // Utilizador comum tentando aceder á área admin → redirecionar
  return router.createUrlTree(['/tarefas-abertas']);
};
};

