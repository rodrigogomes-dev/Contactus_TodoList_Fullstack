import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tarefas-abertas',
    pathMatch: 'full'
  },
  {
    path: 'tarefas-abertas',
    loadComponent: () =>
      import('./components/task-list/task-list').then(m => m.TaskListComponent),
    data: { view: 'pendente' }
  },
  {
    path: 'tarefas-concluidas',
    loadComponent: () =>
      import('./components/task-list/task-list').then(m => m.TaskListComponent),
    data: { view: 'concluido' }
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/page-not-found/page-not-found').then(m => m.PageNotFoundComponent)
  }
];
