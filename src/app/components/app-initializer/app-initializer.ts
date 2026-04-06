import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-app-initializer',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <div *ngIf="!isReady(); else content" class="app-loader">
      <div class="loader-container">
        <div class="spinner"></div>
        <p>Inicializando...</p>
      </div>
    </div>
    <ng-template #content>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-loader {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      width: 100%;
      background: #f9fafb;
    }

    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top-color: #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    p {
      color: #6b7280;
      font-size: 0.95rem;
      font-weight: 500;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AppInitializer {
  private authService = inject(AuthService);
  isReady = this.authService.isInitialized;

  constructor() {
    // Trigger initialization if not already done
    if (!this.authService.isInitialized()) {
      const token = this.authService.getToken();
      if (token && !this.authService.isInitialized()) {
        this.authService.getMe().subscribe({
          next: () => {},
          error: () => {}
        });
      }
    }
  }
}
