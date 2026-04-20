import { Component, input, output, signal, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Categoria } from '../../../../services/category';
import { CommonModule } from '@angular/common';

// Validator para cor HEX
function hexColorValidator(control: FormControl): { [key: string]: boolean } | null {
  const value = control.value;
  if (!value) return null;
  
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexColorRegex.test(value) ? null : { invalidHexColor: true };
}

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css'
})
export class CategoryFormComponent implements OnInit {
  category = input<Categoria | null>(null);
  
  close = output<void>();
  save = output<Categoria | Omit<Categoria, 'id'>>();

  isSubmitting = signal(false);
  errorMessage = signal('');

  form = new FormGroup({
    nome: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    cor: new FormControl('#007bff', [Validators.required, hexColorValidator]),
  });

  ngOnInit() {
    const cat = this.category();
    if (cat) {
      this.form.patchValue({
        nome: cat.nome,
        cor: cat.cor,
      });
    }
  }

  onSave() {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const values = this.form.value;
    
    const cat = this.category();
    if (cat) {
      this.save.emit({
        id: cat.id,
        nome: values.nome!.trim(),
        cor: values.cor!,
      });
    } else {
      this.save.emit({
        nome: values.nome!.trim(),
        cor: values.cor!,
      });
    }
  }

  onCancel() {
    this.close.emit();
  }

  // Helpers para template
  get nomeControl() {
    return this.form.get('nome');
  }

  get corControl() {
    return this.form.get('cor');
  }
}
