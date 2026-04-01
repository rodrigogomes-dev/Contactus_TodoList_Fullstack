import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of, forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

export type BadgeMilestone = 'iniciante' | 'intermediario' | 'avancado' | 'especialista' | null;

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

interface BadgeApiResponse {
  id: number;
  nome: string;
  descricao: string;
  icon?: string | null;
  category_id: number | null;
  milestone: BadgeMilestone | 'intermediário' | 'avançado';
  percentage: number;
  icon_url?: string;
  unlocked?: boolean;
}

interface CategoryApiResponse {
  id: number;
  nome: string;
}

type BadgeListResponse = { data: BadgeApiResponse[] } | BadgeApiResponse[];
type CategoryListResponse = { data: CategoryApiResponse[] } | CategoryApiResponse[];

@Injectable({
  providedIn: 'root',
})
export class BadgeService {
  private http = inject(HttpClient);
  private badges = signal<BadgeItem[]>([]);
  private loadError = signal<string | null>(null);

  getBadgesSignal() {
    return this.badges;
  }

  getLoadErrorSignal() {
    return this.loadError;
  }

  loadBadges(): Observable<BadgeItem[]> {
    return forkJoin({
      badges: this.http.get<BadgeListResponse>(`${environment.apiUrl}/badges`),
      // Keep badges visible even if categories endpoint fails in some profiles.
      categories: this.http
        .get<CategoryListResponse>(`${environment.apiUrl}/categories`)
        .pipe(catchError(() => of([] as CategoryApiResponse[]))),
    }).pipe(
      map(({ badges, categories }) => {
        const badgeList = this.unwrapData(badges);
        const categoryList = this.unwrapData(categories);

        const categoryNameById = new Map<number, string>(
          categoryList.map((category) => [category.id, category.nome])
        );

        const mappedBadges = badgeList.map((badge) => {
          const normalizedMilestone = this.normalizeMilestone(badge.milestone);
          const categoria = this.resolveCategoryName(badge, categoryNameById);
          const iconUrl = this.resolveIconUrl(badge);

          if (!badge.nome || !badge.descricao || !iconUrl) {
            throw new Error('Payload de badges incompleto: nome/descricao/icon_url em falta.');
          }

          return {
            id: badge.id,
            nome: badge.nome,
            descricao: badge.descricao,
            categoria,
            milestone: normalizedMilestone,
            percentage: badge.percentage,
            icon_url: iconUrl,
            unlocked: badge.unlocked ?? false,
          };
        });

        const deduped = this.dedupeByCategoryAndMilestone(mappedBadges);
        this.loadError.set(null);
        return deduped;
      }),
      tap((badges) => this.badges.set(badges)),
      catchError((error) => {
        console.error('Error loading badges:', error);
        this.loadError.set('Não foi possível carregar badges válidas do backend. Verifica o payload de /api/badges.');
        return of([]);
      })
    );
  }

  private resolveIconUrl(badge: BadgeApiResponse): string | null {
    if (badge.icon_url?.trim()) {
      return badge.icon_url.trim();
    }

    if (badge.icon?.trim()) {
      const rawIcon = badge.icon.trim();
      // Backend-driven convention: icon may come as full iconify id or simple token.
      const iconifyId = rawIcon.includes(':') ? rawIcon : `lsicon:${rawIcon}-filled`;
      return `https://api.iconify.design/${iconifyId}.svg?color=%230056CC&width=128&height=128`;
    }

    return null;
  }

  private resolveCategoryName(
    badge: BadgeApiResponse,
    categoryNameById: Map<number, string>
  ): string {
    if (badge.category_id) {
      return categoryNameById.get(badge.category_id) ?? `Categoria ${badge.category_id}`;
    }

    // Fallback: parse category name from badge title pattern "Categoria - Milestone".
    const title = badge.nome?.trim();
    if (title?.includes(' - ')) {
      return title.split(' - ')[0].trim() || 'Geral';
    }

    return 'Geral';
  }

  private normalizeMilestone(milestone: BadgeApiResponse['milestone']): BadgeMilestone {
    if (milestone === null) {
      return null;
    }

    const normalized = milestone
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (normalized === 'iniciante') return 'iniciante';
    if (normalized === 'intermediario') return 'intermediario';
    if (normalized === 'avancado') return 'avancado';
    if (normalized === 'especialista') return 'especialista';

    return null;
  }

  private unwrapData<T>(response: { data: T[] } | T[]): T[] {
    return Array.isArray(response) ? response : response.data;
  }

  private dedupeByCategoryAndMilestone(badges: BadgeItem[]): BadgeItem[] {
    const seen = new Set<string>();
    const deduped: BadgeItem[] = [];

    for (const badge of badges) {
      const key = `${badge.categoria}::${badge.milestone ?? 'base'}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      deduped.push(badge);
    }

    return deduped;
  }
}
