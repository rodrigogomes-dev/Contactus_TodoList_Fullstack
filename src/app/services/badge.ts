import { Injectable, signal } from '@angular/core';

export type BadgeMilestone = 'iniciante' | 'intermediario' | 'avancado' | 'especialista';

export interface BadgeItem {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  milestone: BadgeMilestone;
  percentage: number;
  icon_url: string;
  unlocked: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BadgeService {
  private badges = signal<BadgeItem[]>([
    {
      id: 1,
      nome: 'Badge Iniciante',
      descricao: 'Nivel inicial do sistema de conquistas.',
      categoria: 'Generica',
      milestone: 'iniciante',
      percentage: 72,
      icon_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=badge-iniciante',
      unlocked: false,
    },
    {
      id: 2,
      nome: 'Badge Intermediario',
      descricao: 'Nivel intermédio com maior consistencia.',
      categoria: 'Generica',
      milestone: 'intermediario',
      percentage: 44,
      icon_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=badge-intermediario',
      unlocked: false,
    },
    {
      id: 3,
      nome: 'Badge Avancado',
      descricao: 'Nivel avancado reservado a progresso elevado.',
      categoria: 'Generica',
      milestone: 'avancado',
      percentage: 19,
      icon_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=badge-avancado',
      unlocked: false,
    },
    {
      id: 4,
      nome: 'Badge Especialista',
      descricao: 'Nivel maximo: dominio completo da progressao.',
      categoria: 'Generica',
      milestone: 'especialista',
      percentage: 7,
      icon_url: 'https://api.dicebear.com/9.x/shapes/svg?seed=badge-especialista',
      unlocked: false,
    },
  ]);

  getBadgesSignal() {
    return this.badges;
  }
}
