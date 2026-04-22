import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interceptor: errorInterceptor
 * Manipula erros HTTP de forma centralizada.
 * 
 * Fluxo:
 *  1. Intercepta response (sucesso ou erro)
 *  2. catchError() detecta erros HTTP
 *  3. Se erro 401 (Unauthorized):
 *     - Token expirou ou é inválido
 *     - Remover token do localStorage
 *     - App detecta auth.authenticated() = false
 *     - Guards redirecionam para /login
 *  4. throwError() propaga erro para componente tratar
 * 
 * Nota: Registado em app.config.ts com httpInterceptors: [errorInterceptor]
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se recebeu 401 (Unauthorized), token expirou
      if (error.status === 401) {
        localStorage.removeItem('auth_token');          // Remover token inválido
        // App será redirecionado para login automaticamente pelos guards
      }
      // Propagar erro para componente tratar (ex: mostrar mensagem)
      return throwError(() => error);
    })
  );
};
