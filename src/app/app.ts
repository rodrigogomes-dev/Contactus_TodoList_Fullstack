import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';
import { AppShell } from './components/app-shell/app-shell';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AppShell],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  auth = inject(AuthService);
  router = inject(Router);
  menuOpen = signal<boolean>(false);

  toggleMenu() { this.menuOpen.update(v => !v); }

  isLandingPage() {
    const cleanUrl = this.router.url.split('?')[0].split('#')[0];
    return cleanUrl === '' || cleanUrl === '/';
  }

  isPublicPage() {
    const cleanUrl = this.router.url.split('?')[0].split('#')[0];
    return cleanUrl === '/login' || cleanUrl === '/register';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
