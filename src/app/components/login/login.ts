import { Component, inject, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

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

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
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
    this.loginForm.reset();
    this.registerForm.reset();
  }

  login() {
    if (this.loginForm.invalid) return;
    const { username, password } = this.loginForm.value;
    if (username === 'admin' && password === 'password') {
      this.auth.login('admin');
      this.router.navigate(['/admin']);
    } else if (username === 'user' && password === 'password') {
      this.auth.login('user');
      this.router.navigate(['/tarefas-abertas']);
    } else {
      alert('Credenciais inválidas. Tente novamente.');
    }
  }

  register() {
    if (this.registerForm.invalid) return;
    // TODO: ligar ao backend
    alert(`Conta criada para ${this.registerForm.value.nome}!`);
    this.toggleView();
  }
}
