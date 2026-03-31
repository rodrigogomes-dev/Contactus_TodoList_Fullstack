import { Component, input, output, signal, OnInit } from '@angular/core';
import { Categoria } from '../../../../services/category';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css'
})
export class CategoryFormComponent implements OnInit {
  category = input<Categoria | null>(null);
  
  close = output<void>();
  save = output<Categoria | Omit<Categoria, 'id'>>();

  nome = signal<string>('');
  cor = signal<string>('#007bff');

  ngOnInit() {
    const cat = this.category();
    if (cat) {
        // Se recebermos uma categoria pelo input, estamos em modo Edição.
      this.nome.set(cat.nome);
      this.cor.set(cat.cor);
    }
  }

  onSave() {
    if (!this.nome().trim()) return;

    const cat = this.category();
    if (cat) {
      this.save.emit({
        id: cat.id,
        nome: this.nome().trim(),
        cor: this.cor()
      });
    } else {
      this.save.emit({
        nome: this.nome().trim(),
        cor: this.cor()
      });
    }
  }

  onCancel() {
    this.close.emit();
  }
}
