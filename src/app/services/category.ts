import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Categoria {
  id: number;
  nome: string;
  cor: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categoriesMock = signal<Categoria[]>([
    { id: 1, nome: 'Trabalho', cor: '#007bff' },
    { id: 2, nome: 'Pessoal', cor: '#10b981' },
    { id: 3, nome: 'Urgente', cor: '#ef4444' },
    { id: 4, nome: 'Projetos', cor: '#8b5cf6' },
  ]);

  getCategories(): Observable<Categoria[]> {
    return of(this.categoriesMock()).pipe(delay(500));
  }

  getCategoriesSignal() {
    return this.categoriesMock;
  }

  addCategory(cat: Omit<Categoria, 'id'>) {
    const newId = Math.max(...this.categoriesMock().map(c => c.id), 0) + 1;
    this.categoriesMock.update(list => [...list, { id: newId, ...cat }]);
  }

  updateCategory(updatedCat: Categoria) {
    this.categoriesMock.update(list => 
      list.map(c => c.id === updatedCat.id ? updatedCat : c)
    );
  }

  deleteCategory(id: number) {
    this.categoriesMock.update(list => list.filter(c => c.id !== id));
  }
}
