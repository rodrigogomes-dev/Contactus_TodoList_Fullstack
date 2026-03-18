import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TaskService, Tarefa } from '../services/task';

export const taskResolver: ResolveFn<Tarefa | undefined> = (route) => {
  const taskService = inject(TaskService);
  const id = Number(route.paramMap.get('id'));
  return taskService.getById(id);
};

