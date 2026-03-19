import { Injectable, signal } from '@angular/core';

@Injectable({providedIn: 'root',})
export class AuthService {
  authenticated = signal<boolean>(false);
  role = signal<'admin' | 'user'>('user');
  username = signal<string>('');
  nome = signal<string>('');
  email = signal<string>('');

  login(role: 'admin' | 'user', username: string) {
    this.authenticated.set(true);
    this.role.set(role);
    this.username.set(username);
    this.nome.set(username);
    this.email.set(`${username}@todoapp.com`);
  }

  updateProfile(nome: string, email: string) {
    this.nome.set(nome);
    this.email.set(email);
    this.username.set(nome);
  }

  logout() {
    this.authenticated.set(false);
    this.role.set('user');
    this.username.set('');
    this.nome.set('');
    this.email.set('');
  }
}
