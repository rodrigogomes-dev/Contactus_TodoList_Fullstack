import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor: authInterceptor
 * Adiciona token Sanctum a TODOS os HTTP requests.
 * 
 * Fluxo:
 *  1. Intercepta cada request HTTP (GET, POST, PATCH, etc)
 *  2. Verifica se existe token no localStorage
 *  3. Se existe, clona o request e adiciona header Authorization: Bearer {token}
 *  4. Se não existe, deixa request intocado
 *  5. Passa para próximo handler (next)
 * 
 * Nota: Registado em app.config.ts com httpInterceptors: [authInterceptor]
 * Resultado: Backend recebe token em toda a request protegida
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Tentar obter token do localStorage
  const token = localStorage.getItem('auth_token');

  // Se não tem token, passar request como está
  if(!token){
    return next(req);
  }
  
  // Clonar request e adicionar header Authorization
  // Bearer é o padrão OAuth2/Sanctum (format: "Bearer {token}")
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  // Passar request modificado para o handler seguinte
  return next(authReq);
};
