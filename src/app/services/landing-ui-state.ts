import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LandingUiStateService {
  readonly sectionIds = ['entrar', 'vantagens', 'workflow', 'badges', 'about'] as const;

  activeSection = signal<string>('entrar');
  scrollProgress = signal<number>(0);

  setActiveSection(section: string): void {
    this.activeSection.set(section);
  }

  setScrollProgress(progress: number): void {
    const clamped = Math.min(100, Math.max(0, progress));
    this.scrollProgress.set(clamped);
  }

  reset(): void {
    this.activeSection.set('entrar');
    this.scrollProgress.set(0);
  }
}