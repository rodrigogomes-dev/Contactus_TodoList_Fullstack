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
  /**
   * Injeção de dependência
   */
  private http = inject(HttpClient);
  
  /**
   * Signal: Lista de categorias (only admin pode create/update/delete).
   * Componentes acesso via getCategoriesSignal().
   */
  private categories = signal<Categoria[]>([]);

  /**
   * Endpoint: GET /api/categories
   * Obter todas as categorias disponíveis.
   * 
   * Fluxo:
   *  1. GET ao backend
   *  2. Map: extrair campos úteis (id, nome, cor)
   *  3. Tap: atualizar signal
   */
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

  /**
   * Obter acesso ao signal de categorias para reatividade.
   */
  getCategoriesSignal() {
    return this.categories;
  }

  /**
   * Endpoint: POST /api/categories
   * Criar nova categoria (only admin).
   * 
   * Fluxo:
   *  1. POST ao backend com nome e cor
   *  2. Map: extrair campos da resposta
   *  3. Tap: adicionar ao signal
   */
  addCategory(cat: Omit<Categoria, 'id'>): Observable<Categoria> {
    return this.http.post<CategoryApiResponse>(`${environment.apiUrl}/categories`, cat).pipe(
      map((created) => ({
        id: created.id,
        nome: created.nome,
        cor: created.cor,
      })),
      tap((createdCategory) => {
        // Adicionar categoria ao signal
        this.categories.update((list) => [...list, createdCategory]);
      })
    );
  }

  /**
   * Endpoint: PUT /api/categories/{id}
   * Atualizar categoria existente (only admin).
   * 
   * Fluxo:
   *  1. PUT com nome e cor
   *  2. Map: extrair resposta
   *  3. Tap: atualizar signal (encontrar por ID)
   */
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
        // Substituir no signal
        this.categories.update((list) =>
          list.map((c) => (c.id === category.id ? category : c))
        );
      })
    );
  }

  /**
   * Endpoint: DELETE /api/categories/{id}
   * Deletar categoria (only admin).
   * 
   * Fluxo:
   *  1. DELETE ao backend
   *  2. Tap: remover de signal
   */
  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/categories/${id}`).pipe(
      tap(() => {
        // Remover do signal
        this.categories.update((list) => list.filter((c) => c.id !== id));
      })
    );
  }
}
