import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, firstValueFrom, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiMessageResponse } from '../../types/api';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * Injeções de dependência
   * - HttpClient: Para fazer requests ao backend
   */
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;              // URL base da API (ex: http://localhost:8000/api)
  private tokenKey = 'auth_token';                   // Chave localStorage para guardar token Sanctum

  /**
   * Sinais (Signals) Angular 17+ - Reatividade sem RxJS direto
   * Permitem componentes reagir a mudanças de estado sem subscrições
   */
  authenticated = signal<boolean>(false);             // Utilizador está logado?
  role = signal<'admin' | 'user'>('user');          // Papel: admin ou user
  username = signal<string>('');                     // Nome de utilizador
  nome = signal<string>('');                         // Nome completo
  email = signal<string>('');                        // Email
  currentUser = signal<AuthUser | null>(null);      // Dados completos do utilizador atual
  isInitialized = signal<boolean>(false);            // Auth foi inicializado?
  sessionValid = signal<boolean>(false);             // Sessão é válida e ativa?

  constructor() {
    this.initializeAuth();                            // Verificar token ao inicializar
  }

  /**
   * Inicializar autenticação no startup da app.
   * 
   * Processo:
   *  1. Verifica se existe token no localStorage
   *  2. Se tem token, faz request GET /me para validar
   *  3. Se válido, carrega dados do utilizador nos signals
   *  4. Se inválido ou erro, limpa session
   *  5. Define isInitialized=true (app sabe que pode renderizar)
   * 
   * Nota: Async porque usa firstValueFrom() para converter Observable → Promise
   */
  private async initializeAuth() {
    const token = this.getToken();
    
    if (token) {
      this.authenticated.set(true);
      try {
        // Converter Observable para Promise (await o resultado)
        const user = await firstValueFrom(this.getMe());
        
        // Validar que utilizador tem campos obrigatórios
        if (user && user.id && user.is_admin !== undefined) {
          this.sessionValid.set(true);                // Sessão válida ✅
        } else {
          this.clearSession();                        // Sessão inválida ❌
          this.sessionValid.set(false);
        }
        this.isInitialized.set(true);
      } catch (err) {
        // Token inválido ou expired → erro HTTP (401/403)
        this.clearSession();
        this.sessionValid.set(false);
        this.isInitialized.set(true);
      }
    } else {
      // Nenhum token encontrado
      this.sessionValid.set(false);
      this.isInitialized.set(true);
    }
  }

  /**
   * Endpoint: POST /login
   * Fazer login com email + password
   * 
   * Fluxo:
   *  1. Send credentials ao backend
   *  2. Backend valida e retorna token + user data
   *  3. tap() chama applySession() para guardar token e atualizar signals
   *  4. Componente pode subscrever e redirecionar
   */
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => this.applySession(response))
    );
  }

  /**
   * Endpoint: POST /register
   * Criar nova conta
   * 
   * Mesmo fluxo que login - retorna token imediatamente
   */
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => this.applySession(response))
    );
  }

  /**
   * Endpoint: POST /logout
   * Fazer logout (invalida token no backend)
   * 
   * Fluxo:
   *  1. POST ao endpoint /logout (token no header Authorization)
   *  2. Backend invalida o token
   *  3. tap() chama clearSession() para limpar dados locais
   *  4. Componente redireciona para login
   */
  logout(): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  /**
   * Endpoint: GET /me
   * Obter dados do utilizador autenticado.
   * 
   * Retorna:
   *  - ID, nome, email, is_admin, avatar_url, badges
   * 
   * Usado em:
   *  - initializeAuth() (verificar validade de token)
   *  - Guards (verificar permissões)
   *  - Perfil do utilizador
   */
  getMe(): Observable<AuthUser> {
    return this.http.get<{ user: AuthUser }>(`${this.apiUrl}/me`).pipe(
      map(response => response.user),                           // Extrair campo 'user'
      tap((user) => {
        // Atualizar todos os signals com dados do utilizador
        this.currentUser.set(user);
        this.authenticated.set(true);
        this.role.set(user.is_admin === 1 ? 'admin' : 'user');  // is_admin é 1 (true) ou 0 (false)
        this.username.set(user.name);
        this.nome.set(user.name);
        this.email.set(user.email);
      })
    );
  }

  /**
   * Endpoint: PATCH /me
   * Atualizar dados do perfil do utilizador.
   * 
   * Atributos opcionais:
   *  - name: Novo nome
   *  - email: Novo email
   *  - password + password_confirmation: Mudar password
   * 
   * Nota: Se password não for preenchido ou vazio, não muda
   */
  updateProfile(nome: string, email: string, senha?: string): Observable<{ user: AuthUser }> {
    const payload: any = {
      name: nome,
      email,
    };

    // Só enviar password se foi preenchido
    if (senha && senha.trim().length > 0) {
      payload.password = senha;
      payload.password_confirmation = senha;           // Laravel requer confirmação
    }

    return this.http.patch<{ user: AuthUser }>(`${this.apiUrl}/me`, payload).pipe(
      tap(() => {
        // Atualizar signals com novos dados
        this.nome.set(nome);
        this.email.set(email);
        this.username.set(nome);

        const user = this.currentUser();
        if (user) {
          // Atualizar currentUser com novos valores
          this.currentUser.set({
            ...user,
            name: nome,
            email,
          });
        }
      })
    );
  }

  /**
   * Endpoint: POST /users/avatar (FormData)
   * Carregar novo avatar para o utilizador.
   * 
   * Recebe:
   *  - file: File (image/png, image/jpeg)
   * 
   * Backend:
   *  - Salva em storage/avatars
   *  - Apaga avatar antigo se existia
   *  - Retorna novo user com avatar_url
   */
  uploadAvatar(file: File): Observable<{ user: AuthUser }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ message: string; user: AuthUser }>(`${this.apiUrl}/users/avatar`, formData).pipe(
      tap((response) => {
        const user = response.user;
        // Atualizar signals do utilizador (agora tem novo avatar_url)
        this.currentUser.set(user);
        this.nome.set(user.name);
        this.email.set(user.email);
        this.username.set(user.name);
      })
    );
  }

  /**
   * Obter token do localStorage.
   * Retorna null se não existe.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Guardar token no localStorage.
   * Token é usado em todos os requests (via AuthInterceptor).
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Remover token do localStorage.
   * Chamado no logout ou quando sessão expira.
   */
  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Aplicar session após login/register bem-sucedido.
   * 
   * Ações:
   *  1. Guardar token no localStorage
   *  2. Atualizar todos os signals
   *  3. Marcar authenticated = true, sessionValid = true
   *  4. Determinar se é admin ou user
   */
  private applySession(response: AuthResponse): void {
    this.setToken(response.token);                              // Guardar token
    this.currentUser.set(response.user);
    this.authenticated.set(true);
    this.sessionValid.set(true);
    this.role.set(response.user.is_admin === 1 ? 'admin' : 'user');
    this.username.set(response.user.name);
    this.nome.set(response.user.name);
    this.email.set(response.user.email);
  }

  /**
   * Limpar session após logout.
   * 
   * Ações:
   *  1. Remover token do localStorage
   *  2. Resetar todos os signals para estado inicial
   *  3. Marcar como não autenticado
   *  4. Componentes com @if (auth.authenticated()) vão desaparecer
   */
  private clearSession(): void {
    this.removeToken();
    this.currentUser.set(null);
    this.authenticated.set(false);
    this.sessionValid.set(false);
    this.role.set('user');
    this.username.set('');
    this.nome.set('');
    this.email.set('');
  }
}