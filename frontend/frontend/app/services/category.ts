import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Categoria {
  id: number;
  nome: string;
  cor: string;
}

interface CategoryApiResponse {
  id: number;
  nome: string;
  cor: string;
  created_at: string;
  updated_at: string;
}

interface CategoriesPaginatedResponse {
  data: CategoryApiResponse[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private categories = signal<Categoria[]>([]);

  getCategories(): Observable<Categoria[]> {
    return this.http.get<CategoriesPaginatedResponse>(`${environment.apiUrl}/categories`).pipe(
      map((response) => response.data.map((cat) => ({
        id: cat.id,
        nome: cat.nome,
        cor: cat.cor,
      }))),
      tap((categories) => this.categories.set(categories))
    );
  }

  getCategoriesSignal() {
    return this.categories;
  }

  addCategory(cat: Omit<Categoria, 'id'>): Observable<Categoria> {
    return this.http.post<CategoryApiResponse>(`${environment.apiUrl}/categories`, cat).pipe(
      map((created) => ({
        id: created.id,
        nome: created.nome,
        cor: created.cor,
      })),
      tap((createdCategory) => {
        this.categories.update((list) => [...list, createdCategory]);
      })
    );
  }

  updateCategory(updatedCat: Categoria): Observable<Categoria> {
    return this.http.put<CategoryApiResponse>(`${environment.apiUrl}/categories/${updatedCat.id}`, {
      nome: updatedCat.nome,
      cor: updatedCat.cor,
    }).pipe(
      map((updated) => ({
        id: updated.id,
        nome: updated.nome,
        cor: updated.cor,
      })),
      tap((category) => {
        this.categories.update((list) =>
          list.map((c) => (c.id === category.id ? category : c))
        );
      })
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${id}`).pipe(
      tap(() => {
        this.categories.update((list) => list.filter((c) => c.id !== id));
      })
    );
  }
}
