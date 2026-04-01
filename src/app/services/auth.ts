import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

  constructor() {
    const token = this.getToken();
    if (token) {
      this.authenticated.set(true);
      this.getMe().subscribe({
        error: () => this.clearSession(),
      });
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
    return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
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

  updateProfile(nome: string, email: string): void {
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
    this.role.set(response.user.is_admin === 1 ? 'admin' : 'user');
    this.username.set(response.user.name);
    this.nome.set(response.user.name);
    this.email.set(response.user.email);
  }

  private clearSession(): void {
    this.removeToken();
    this.currentUser.set(null);
    this.authenticated.set(false);
    this.role.set('user');
    this.username.set('');
    this.nome.set('');
    this.email.set('');
  }
}