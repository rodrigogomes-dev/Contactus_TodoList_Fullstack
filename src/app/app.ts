import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  auth   = inject(AuthService);
  router = inject(Router);
  menuOpen = signal<boolean>(false);

  toggleMenu() { this.menuOpen.update(v => !v); }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
