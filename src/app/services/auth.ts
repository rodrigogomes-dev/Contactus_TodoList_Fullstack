import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, firstValueFrom, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiMessageResponse } from '../../types/api';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../types/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth_token';

  authenticated = signal<boolean>(false);
  role = signal<'admin' | 'user'>('user');
  username = signal<string>('');
  nome = signal<string>('');
  email = signal<string>('');
  currentUser = signal<AuthUser | null>(null);
  isInitialized = signal<boolean>(false);
  sessionValid = signal<boolean>(false);

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    const token = this.getToken();
    
    if (token) {
      this.authenticated.set(true);
      try {
        const user = await firstValueFrom(this.getMe());
        
        // Validate that user has required fields
        if (user && user.id && user.is_admin !== undefined) {
          this.sessionValid.set(true);
        } else {
          this.clearSession();
          this.sessionValid.set(false);
        }
        this.isInitialized.set(true);
      } catch (err) {
        this.clearSession();
        this.sessionValid.set(false);
        this.isInitialized.set(true);
      }
    } else {
      this.sessionValid.set(false);
      this.isInitialized.set(true);
    }
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap((response) => this.applySession(response))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap((response) => this.applySession(response))
    );
  }

  logout(): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  getMe(): Observable<AuthUser> {
    return this.http.get<{ user: AuthUser }>(`${this.apiUrl}/me`).pipe(
      map(response => response.user),
      tap((user) => {
        this.currentUser.set(user);
        this.authenticated.set(true);
        this.role.set(user.is_admin === 1 ? 'admin' : 'user');
        this.username.set(user.name);
        this.nome.set(user.name);
        this.email.set(user.email);
      })
    );
  }

  updateProfile(nome: string, email: string, senha?: string): Observable<{ user: AuthUser }> {
    const payload: any = {
      name: nome,
      email,
    };

    if (senha && senha.trim().length > 0) {
      payload.password = senha;
      payload.password_confirmation = senha;
    }

    return this.http.patch<{ user: AuthUser }>(`${this.apiUrl}/me`, payload).pipe(
      tap(() => {
        this.nome.set(nome);
        this.email.set(email);
        this.username.set(nome);

        const user = this.currentUser();
        if (user) {
          this.currentUser.set({
            ...user,
            name: nome,
            email,
          });
        }
      })
    );
  }

  uploadAvatar(file: File): Observable<{ user: AuthUser }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ message: string; user: AuthUser }>(`${this.apiUrl}/users/avatar`, formData).pipe(
      tap((response) => {
        const user = response.user;
        this.currentUser.set(user);
        this.nome.set(user.name);
        this.email.set(user.email);
        this.username.set(user.name);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  private applySession(response: AuthResponse): void {
    this.setToken(response.token);
    this.currentUser.set(response.user);
    this.authenticated.set(true);
    this.sessionValid.set(true);
    this.role.set(response.user.is_admin === 1 ? 'admin' : 'user');
    this.username.set(response.user.name);
    this.nome.set(response.user.name);
    this.email.set(response.user.email);
  }

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