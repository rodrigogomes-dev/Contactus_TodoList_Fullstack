import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TaskService } from '../services/task';
import { TaskApiResponse } from '../types/task';

export const taskResolver: ResolveFn<TaskApiResponse | undefined> = (route) => {
  const taskService = inject(TaskService);
  const id = Number(route.paramMap.get('id'));
  return taskService.getById(id);
};

