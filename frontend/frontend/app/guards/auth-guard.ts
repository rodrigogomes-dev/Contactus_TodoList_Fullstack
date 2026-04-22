import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { firstValueFrom } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

/**
 * Guard: authGuard
 * Proteção de rotas que requerem autenticação.
 * 
 * Verificações:
 *  1. Esperar pelo finalizamento da inicialização da auth (isInitialized = true)
 *  2. Validar que sessionValid && authenticated
 *  3. Se tudo ok, permitir acesso (return true)
 *  4. Se falhar, redirecionar para /login
 * 
 * Nota: Usado em app.routes.ts com canActivate: [authGuard]
 */
export const authGuard: CanActivateFn = async () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  // Aguardar que auth seja inicializada (token validado, user carregado, etc)
  // toObservable() converte Signal -> Observable
  // filter() aguarda até isInitialized ser true
  // firstValueFrom() converte Observable -> Promise (para usar await)
  await firstValueFrom(
    toObservable(auth.isInitialized).pipe(
      filter(initialized => initialized === true)
    )
  );

  // Verificar se sessão é válida E utilizador está autenticado
  if (auth.sessionValid() && auth.authenticated()) {
    return true;                                       // ✅ Permitir acesso
  }

  // ❌ Negar acesso e redirecionar para login
  return router.createUrlTree(['/login']);
};

