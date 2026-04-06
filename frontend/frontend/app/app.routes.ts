import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { saveGuard } from './guards/save-guard';
import { roleGuard } from './guards/role-guard';
import { userGuard } from './guards/user-guard';
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
    canActivate: [authGuard, userGuard],
    canDeactivate: [saveGuard],
    data: { view: 'pendente' }
  },
  {
    path: 'tarefas-concluidas',
    loadComponent: () =>
      import('./components/task-list/task-list').then(m => m.TaskListComponent),
    canActivate: [authGuard, userGuard],
    canDeactivate: [saveGuard],
    data: { view: 'concluido' }
  },
  {
    path: 'admin',
    redirectTo: 'admin/estatisticas',
    pathMatch: 'full'
  },
  {
    path: 'admin/categorias',
    loadComponent: () =>
      import('./components/admin/categories/categories').then(m => m.Categories),
    canActivate: [authGuard, roleGuard]
  },
  {
    path: 'admin/estatisticas',
    loadComponent: () =>
      import('./components/admin/statistics/statistics').then(m => m.Statistics),
    canActivate: [authGuard, roleGuard]
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./components/profile/profile').then(m => m.ProfileComponent),
    canActivate: [authGuard, userGuard]
  },
  {
    path: 'mybadges',
    loadComponent: () =>
      import('./components/my-badges/my-badges').then(m => m.MyBadges),
    canActivate: [authGuard, userGuard]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/page-not-found/page-not-found').then(m => m.PageNotFoundComponent)
  }
];
