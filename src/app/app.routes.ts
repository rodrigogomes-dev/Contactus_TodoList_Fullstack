import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { saveGuard } from './guards/save-guard';
import { roleGuard } from './guards/role-guard';
import { taskResolver } from './guards/task-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/landing/landing').then(m => m.Landing)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'tarefas-abertas',
    loadComponent: () =>
      import('./components/task-list/task-list').then(m => m.TaskListComponent),
    canActivate: [authGuard],
    canDeactivate: [saveGuard],
    data: { view: 'pendente' }
  },
  {
    path: 'tarefas-concluidas',
    loadComponent: () =>
      import('./components/task-list/task-list').then(m => m.TaskListComponent),
    canActivate: [authGuard],
    canDeactivate: [saveGuard],
    data: { view: 'concluido' }
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin').then(m => m.AdminComponent),
    canActivate: [authGuard],
    canMatch: [roleGuard]
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./components/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/page-not-found/page-not-found').then(m => m.PageNotFoundComponent)
  }
];
