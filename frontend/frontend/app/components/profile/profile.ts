import { Component, inject, computed, signal, effect } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { TaskService } from '../../services/task';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
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
  currentUser = this.auth.currentUser;
  isInitialized = this.auth.isInitialized;

  showModal = signal(false);
  showAvatarModal = signal(false);
  isSaving = signal(false);
  saveMessage = signal('');
  saveError = signal('');
  isUploadingAvatar = signal(false);
  avatarUploadError = signal('');
  avatarFileName = signal('');
  selectedAvatarFile: File | null = null;
  selectedAvatarId = signal<string>('');

  // Array de avatares pré-definidos disponíveis
  availableAvatars = [
    { id: 'avatar-1', label: 'Avatar 1' },
    { id: 'avatar-2', label: 'Avatar 2' },
    { id: 'avatar-3', label: 'Avatar 3' },
    { id: 'avatar-4', label: 'Avatar 4' },
    { id: 'avatar-5', label: 'Avatar 5' },
    { id: 'avatar-6', label: 'Avatar 6' },
    { id: 'avatar-7', label: 'Avatar 7' },
    { id: 'avatar-8', label: 'Avatar 8' },
    { id: 'avatar-9', label: 'Avatar 9' },
    { id: 'avatar-10', label: 'Avatar 10' },
  ];

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

  // Load tasks when auth is initialized
  private loadTasksEffect = effect(() => {
    if (this.auth.isInitialized()) {
      this.taskService.getTasks().subscribe();
    }
  });

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

  openAvatarModal() {
    this.showAvatarModal.set(true);
    this.avatarUploadError.set('');
    this.selectedAvatarId.set('');
  }

  closeAvatarModal() {
    this.showAvatarModal.set(false);
    this.avatarUploadError.set('');
    this.selectedAvatarId.set('');
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.avatarUploadError.set('Por favor seleciona um ficheiro de imagem válido');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.avatarUploadError.set('A imagem não pode exceder 2MB');
      return;
    }

    this.selectedAvatarFile = file;
    this.avatarFileName.set(file.name);
    this.avatarUploadError.set('');
    this.uploadAvatar();
  }

  uploadAvatar() {
    if (!this.selectedAvatarFile) return;

    this.isUploadingAvatar.set(true);
    this.avatarUploadError.set('');

    this.auth.uploadAvatar(this.selectedAvatarFile).subscribe({
      next: () => {
        this.isUploadingAvatar.set(false);
        this.saveMessage.set('Avatar atualizado com sucesso!');
        this.selectedAvatarFile = null;
        this.avatarFileName.set('');
        
        // Refresh user data after a short delay to ensure backend has persisted
        setTimeout(() => {
          this.auth.getMe().subscribe();
        }, 500);
        
        setTimeout(() => {
          this.saveMessage.set('');
        }, 2000);
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        this.avatarUploadError.set(err?.error?.message || 'Erro ao atualizar avatar');
      }
    });
  }

  selectAvatar(avatarId: string) {
    this.isUploadingAvatar.set(true);
    this.avatarUploadError.set('');
    this.selectedAvatarId.set(avatarId);

    this.auth.selectAvatar(avatarId).subscribe({
      next: () => {
        this.isUploadingAvatar.set(false);
        this.saveMessage.set('Avatar selecionado com sucesso!');
        
        // Refresh user data after a short delay to ensure backend has persisted
        setTimeout(() => {
          this.auth.getMe().subscribe();
        }, 500);
        
        setTimeout(() => {
          this.saveMessage.set('');
        }, 2000);
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        this.avatarUploadError.set(err?.error?.message || 'Erro ao selecionar avatar');
        this.selectedAvatarId.set('');
      }
    });
  }

  saveProfile() {
    if (this.editForm.valid) {
      this.isSaving.set(true);
      this.saveError.set('');
      this.saveMessage.set('');

      this.auth.updateProfile(
        this.editForm.value.nome!,
        this.editForm.value.email!,
        this.editForm.value.senha || undefined
      ).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saveMessage.set('Perfil atualizado com sucesso!');
          setTimeout(() => {
            this.closeModal();
          }, 1500);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.saveError.set(err?.error?.message || 'Erro ao atualizar perfil');
        }
      });
    }
  }
}
