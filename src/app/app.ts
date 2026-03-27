import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';
import { LandingUiStateService } from './services/landing-ui-state';

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
  private landingUiState = inject(LandingUiStateService);
  menuOpen = signal<boolean>(false);
  activeLandingSection = this.landingUiState.activeSection;
  landingScrollProgress = this.landingUiState.scrollProgress;

  toggleMenu() { this.menuOpen.update(v => !v); }

  isLandingPage() {
    const cleanUrl = this.router.url.split('?')[0].split('#')[0];
    return cleanUrl === '' || cleanUrl === '/';
  }

  scrollToLandingSection(fragment: string, event: Event) {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    event.preventDefault();
    const target = document.getElementById(fragment);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.landingUiState.setActiveSection(fragment);
    window.history.replaceState(null, '', `#${fragment}`);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
