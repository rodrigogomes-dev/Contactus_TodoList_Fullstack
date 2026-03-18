import { Injectable, signal } from '@angular/core';

@Injectable({providedIn: 'root',})
export class AuthService {
  authenticated = signal<boolean>(false);
  role = signal<'admin' | 'user'>('user');

  login(role: 'admin' | 'user') {
    this.authenticated.set(true);
    this.role.set(role);
  }

  logout() {
    this.authenticated.set(false);
    this.role.set('user');
  }
}
