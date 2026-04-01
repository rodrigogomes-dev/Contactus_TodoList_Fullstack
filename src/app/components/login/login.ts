import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import {finalize} from 'rxjs/operators';
import { LoginRequest, RegisterRequest } from '../../types/auth.model';
import { ApiValidationError } from '../../../types/api';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const senha = control.get('senha');
  const confirmar = control.get('confirmarSenha');
  if (senha && confirmar && senha.value !== confirmar.value) {
    confirmar.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);

  isRegister = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string>('');

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  registerForm = new FormGroup({
    nome:           new FormControl('', [Validators.required, Validators.maxLength(100)]),
    email:          new FormControl('', [Validators.required, Validators.email, Validators.maxLength(150)]),
    senha:          new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(255)]),
    confirmarSenha: new FormControl('', [Validators.required]),
  }, { validators: passwordMatchValidator });

  toggleView() {
    this.isRegister.update(v => !v);
    this.errorMessage.set('');
    this.loginForm.reset();
    this.registerForm.reset();
  }

  login() {
    if (this.loginForm.invalid || this.isSubmitting()) {
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const payload: LoginRequest = {
      email: this.loginForm.value.email?.trim() ?? '',
      password: this.loginForm.value.password ?? '',
    };

    this.auth.login(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: ({ user }) => {
          const target = user.is_admin === 1 ? '/admin' : '/tarefas-abertas';
          this.router.navigate([target]);
        },
        error: (error) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'Credenciais inválidas. Tente novamente.'));
        },
      });
  }

  register() {
    if (this.registerForm.invalid || this.isSubmitting()) {
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    const payload: RegisterRequest = {
      name: this.registerForm.value.nome?.trim() ?? '',
      email: this.registerForm.value.email?.trim() ?? '',
      password: this.registerForm.value.senha ?? '',
    };

    this.auth.register(payload)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: ({ user }) => {
          const target = user.is_admin === 1 ? '/admin' : '/tarefas-abertas';
          this.router.navigate([target]);
        },
        error: (error) => {
          this.errorMessage.set(this.extractErrorMessage(error, 'Não foi possível criar conta.'));
        },
      });
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    const apiError = (error as { error?: ApiValidationError | { message?: string } })?.error;
    if (!apiError) {
      return fallback;
    }

    if ('errors' in apiError && apiError.errors) {
      const messages = Object.values(apiError.errors).flat();
      if (messages.length > 0) {
        return messages[0];
      }
    }

    if ('message' in apiError && apiError.message) {
      return apiError.message;
    }

    return fallback;
  }
}
