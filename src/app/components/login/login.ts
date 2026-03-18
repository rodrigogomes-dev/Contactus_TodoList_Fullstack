import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  username = '';
  password = '';

  login() {
    if (this.username.trim() === 'admin' && this.password.trim() === 'password') {
      this.auth.login('admin');
      this.router.navigate(['/admin']);
    } else if (this.username.trim() === 'user' && this.password.trim() === 'password') {
      this.auth.login('user');
      this.router.navigate(['/tarefas-abertas']);
    } else {
      alert('Credenciais inválidas. Tente novamente.');
    }
  }

  register() {
    alert('Funcionalidade de registo em breve!');
  }
}
