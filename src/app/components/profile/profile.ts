import { Component, inject, computed, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private taskService = inject(TaskService);

  username = this.auth.username;
  role = this.auth.role;
  nome = this.auth.nome;
  email = this.auth.email;

  showModal = signal(false);

  editForm = new FormGroup({
    nome:  new FormControl('', [Validators.required, Validators.maxLength(100)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(150)]),
    senha: new FormControl('', [Validators.minLength(8), Validators.maxLength(255)]),
  });

  tasks = this.taskService.getTasksSignal();

  totalTarefas = computed(() => this.tasks().length);
  totalConcluidas = computed(() => this.tasks().filter(t => t.estado === 'concluido').length);
  totalPendentes = computed(() => this.tasks().filter(t => t.estado === 'pendente').length);
  percentualConcluido = computed(() => {
    const total = this.totalTarefas();
    return total === 0 ? 0 : Math.round((this.totalConcluidas() / total) * 100);
  });

  tarefasAlta = computed(() => this.tasks().filter(t => t.prioridade === 'alta' && t.estado === 'pendente').length);
  tarefasMedia = computed(() => this.tasks().filter(t => t.prioridade === 'media' && t.estado === 'pendente').length);
  tarefasBaixa = computed(() => this.tasks().filter(t => t.prioridade === 'baixa' && t.estado === 'pendente').length);

  openModal() {
    this.editForm.patchValue({
      nome:  this.auth.nome(),
      email: this.auth.email(),
      senha: ''
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editForm.reset();
  }

  saveProfile() {
    if (this.editForm.valid) {
      this.auth.updateProfile(
        this.editForm.value.nome!,
        this.editForm.value.email!
      );
      this.closeModal();
    }
  }
}
