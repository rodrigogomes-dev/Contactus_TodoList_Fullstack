import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BadgeToastService } from '../../services/badge-toast';

@Component({
  selector: 'app-badge-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-toast.html',
  styleUrl: './badge-toast.css',
})
export class BadgeToastComponent {
  private badgeToastService = inject(BadgeToastService);

  toasts = this.badgeToastService.getToastsSignal();

  dismiss(id: number): void {
    this.badgeToastService.dismiss(id);
  }
}
