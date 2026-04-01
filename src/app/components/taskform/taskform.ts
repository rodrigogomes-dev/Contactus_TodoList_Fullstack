import { Component, Output, EventEmitter, Input, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { dateNotInPastValidator } from './date-validator';
import { TaskService } from '../../services/task';
import { Tarefa } from '../../types/task';
import { finalize } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryService } from '../../services/category';

@Component({
  selector: 'app-taskform',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './taskform.html',
  styleUrls: ['./taskform.css'],
})
export class TaskformComponent implements OnInit {
  private taskService = inject(TaskService);
  private categoryService = inject(CategoryService);

  @Input() task: Tarefa | null = null;
  @Output() close = new EventEmitter<void>();

  isSubmitting = false;
  errorMessage = '';
  categories = this.categoryService.getCategoriesSignal();

  form = new FormGroup({
    titulo:       new FormControl('', [Validators.required]),
    descricao:    new FormControl(''),
    categoria:    new FormControl('', [Validators.required]),
    prioridade:   new FormControl('media', [Validators.required]),
    dataValidade: new FormControl('', [dateNotInPastValidator])
  });

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      error: (err) => console.error('Error loading categories in task form:', err),
    });

    if (this.task) {
      this.form.patchValue({
        titulo:       this.task.titulo,
        descricao:    this.task.descricao ?? '',
        categoria:    this.task.categoryId?.toString() ?? '',
        prioridade:   this.task.prioridade,
        dataValidade: this.task.dataVencimento ?? ''
      });
    }
  }

  saveTask() {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    if (this.task) {
      // Update existing task
      this.taskService.updateTask({
        ...this.task,
        titulo:          this.form.value.titulo!,
        descricao:       this.form.value.descricao || '',
        prioridade:      (this.form.value.prioridade as 'alta' | 'media' | 'baixa') ?? 'media',
        dataVencimento:  this.form.value.dataValidade ?? '',
        categoryId:      this.form.value.categoria ? Number(this.form.value.categoria) : null,
      }).pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      ).subscribe({
        next: () => this.close.emit(),
        error: (err) => {
          this.errorMessage = this.extractErrorMessage(err, 'Não foi possível atualizar a tarefa.');
          console.error('Error updating task:', err);
        }
      });
    } else {
      // Create new task
      this.taskService.addTask({
        titulo:         this.form.value.titulo!,
        descricao:      this.form.value.descricao || '',
        estado:         'pendente',
        prioridade:     (this.form.value.prioridade as 'alta' | 'media' | 'baixa') ?? 'media',
        dataVencimento: this.form.value.dataValidade ?? '',
        categoryId:     this.form.value.categoria ? Number(this.form.value.categoria) : null,
      }).pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      ).subscribe({
        next: () => this.close.emit(),
        error: (err) => {
          this.errorMessage = this.extractErrorMessage(err, 'Não foi possível criar a tarefa.');
          console.error('Error creating task:', err);
        }
      });
    }
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse) || !error.error) {
      return fallback;
    }

    const apiError = error.error as { message?: string; errors?: Record<string, string[]> };
    const validationErrors = apiError.errors;

    if (validationErrors) {
      const firstField = Object.keys(validationErrors)[0];
      const firstMessage = firstField ? validationErrors[firstField]?.[0] : null;
      if (firstMessage) {
        return firstMessage;
      }
    }

    if (apiError.message) {
      return apiError.message;
    }

    return fallback;
  }

  cancel() {
    this.close.emit();
  }
}
