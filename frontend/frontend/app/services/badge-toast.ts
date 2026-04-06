import { Injectable, signal } from '@angular/core';
import { BadgeItem } from './badge';

export interface BadgeToastItem {
  id: number;
  title: string;
  message: string;
  iconUrl: string;
  category: string;
  milestone: string;
}

@Injectable({
  providedIn: 'root',
})
export class BadgeToastService {
  private toasts = signal<BadgeToastItem[]>([]);

  getToastsSignal() {
    return this.toasts;
  }

  showBadgeUnlocked(badge: BadgeItem): void {
    const milestoneLabel = badge.milestone ? badge.milestone : 'categoria';

    const toast: BadgeToastItem = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      title: 'Nova badge conquistada!',
      message: `Conquista desbloqueada: ${badge.nome}`,
      iconUrl: badge.icon_url,
      category: badge.categoria,
      milestone: milestoneLabel,
    };

    this.toasts.update((list) => [...list, toast]);

    setTimeout(() => {
      this.dismiss(toast.id);
    }, 4500);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((toast) => toast.id !== id));
  }
}
