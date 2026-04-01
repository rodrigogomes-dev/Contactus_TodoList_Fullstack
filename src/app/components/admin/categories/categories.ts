import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Categoria } from '../../../services/category';
import { BadgeService } from '../../../services/badge';
import { CategoryFormComponent } from './category-form/category-form';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryFormComponent],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class Categories implements OnInit {
  private categoryService = inject(CategoryService);
  private badgeService = inject(BadgeService);

  // Expose the signal containing all categories
  categories = this.categoryService.getCategoriesSignal();

  // Modal State
  showFormModal = signal<boolean>(false);
  editingCategory = signal<Categoria | null>(null);

  // Filters & Pagination
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(5);

  filteredCategories = computed(() => {
    let result = this.categories();
    const q = this.searchQuery().trim().toLowerCase();
    
    if (q) {
      result = result.filter(c => c.nome.toLowerCase().includes(q) || c.id.toString() === q);
    }
    return result;
  });

  totalFiltered = computed(() => this.filteredCategories().length);
  totalPages = computed(() => Math.ceil(this.totalFiltered() / this.itemsPerPage()) || 1);

  paginatedCategories = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredCategories().slice(start, end);
  });

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      error: (err) => console.error('Error loading categories:', err),
    });
  }

  // Handlers
  onSearchChange(val: string) {
    this.searchQuery.set(val);
    this.currentPage.set(1); // Reset page on search
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  openNewCategoryModal() {
    this.editingCategory.set(null);
    this.showFormModal.set(true);
  }

  openEditCategoryModal(cat: Categoria) {
    this.editingCategory.set(cat);
    this.showFormModal.set(true);
  }

  deleteCategory(cat: Categoria) {
    if(confirm(`Tens a certeza que queres eliminar a categoria "${cat.nome}"?`)) {
      this.categoryService.deleteCategory(cat.id).subscribe({
        next: () => {
          this.badgeService.loadBadges().subscribe();
        },
        error: (err) => console.error('Error deleting category:', err),
      });
    }
  }

  onModalClose() {
    this.showFormModal.set(false);
  }

  onSaveCategory(catData: Categoria | Omit<Categoria, 'id'>) {
    if ('id' in catData) {
      // is editing
      this.categoryService.updateCategory(catData as Categoria).subscribe({
        next: () => {
          this.badgeService.loadBadges().subscribe();
          this.showFormModal.set(false);
        },
        error: (err) => console.error('Error updating category:', err),
      });
    } else {
      // is creating
      this.categoryService.addCategory(catData).subscribe({
        next: () => {
          // Backend creates badges automatically when category is created.
          // Reload badges so the UI reflects newly generated badges immediately.
          this.badgeService.loadBadges().subscribe();
          this.showFormModal.set(false);
        },
        error: (err) => console.error('Error creating category:', err),
      });
    }
  }
}
