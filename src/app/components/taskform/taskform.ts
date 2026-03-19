import { Component, Output, EventEmitter, Input, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { dateNotInPastValidator } from './date-validator';
import { TaskService, Tarefa } from '../../services/task';

@Component({
  selector: 'app-taskform',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './taskform.html',
  styleUrls: ['./taskform.css'],
})
export class TaskformComponent implements OnInit {
  private taskService = inject(TaskService);

  @Input() task: Tarefa | null = null;
  @Output() close = new EventEmitter<void>();

  form = new FormGroup({
    titulo:       new FormControl('', [Validators.required]),
    descricao:    new FormControl(''),
    categoria:    new FormControl('', [Validators.required]),
    prioridade:   new FormControl('media', [Validators.required]),
    dataValidade: new FormControl('', [dateNotInPastValidator])
  });

  ngOnInit() {
    if (this.task) {
      this.form.patchValue({
        titulo:       this.task.titulo,
        descricao:    this.task.descricao ?? '',
        categoria:    '',
        prioridade:   this.task.prioridade,
        dataValidade: this.task.data_vencimento
          ? this.task.data_vencimento.toISOString().split('T')[0]
          : ''
      });
    }
  }

  saveTask() {
    if (this.form.valid) {
      const dataValidade = this.form.value.dataValidade
        ? new Date(this.form.value.dataValidade)
        : null;

      if (this.task) {
        this.taskService.updateTask({
          ...this.task,
          titulo:          this.form.value.titulo!,
          descricao:       this.form.value.descricao || null,
          prioridade:      (this.form.value.prioridade as 'baixa' | 'media' | 'alta') ?? 'media',
          data_vencimento: dataValidade,
        });
      } else {
        const maxId = this.taskService.getTasksSignal()().reduce((max: number, t: Tarefa) => t.id > max ? t.id : max, 0);

        this.taskService.addTask({
          id:              maxId + 1,
          id_utilizador:   1,
          titulo:          this.form.value.titulo!,
          descricao:       this.form.value.descricao || null,
          estado:          'pendente',
          prioridade:      (this.form.value.prioridade as 'baixa' | 'media' | 'alta') ?? 'media',
          data_vencimento: dataValidade,
          data_criacao:    new Date(),
          id_categoria:    null,
        });
      }
      this.close.emit();
    }
  }

  cancel() {
    this.close.emit();
  }
}
