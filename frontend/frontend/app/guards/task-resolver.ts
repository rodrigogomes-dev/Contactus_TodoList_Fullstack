import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { TaskService } from '../services/task';
import { TaskApiResponse } from '../types/task';

/**
 * Resolver: taskResolver
 * Pré-carregar dados de tarefa antes de navegar para a rota.
 * 
 * Uso em rotas:
 *  { path: 'edit/:id', component: EditTaskComponent, resolve: { task: taskResolver } }
 * 
 * Fluxo:
 *  1. Utilizador navega para /tarefas/123/edit
 *  2. Resolver extrai ID da rota (paramMap.get('id'))
 *  3. TaskService.getById(123) é chamado
 *  4. Aguarda resposta do backend
 *  5. Dados estão prontos quando componente é renderizado
 *  6. Componente acessa via: this.route.snapshot.data['task']
 * 
 * Benefícios:
 *  - Dados garantidamente carregados antes de renderizar
 *  - UI não mostra "loading" (transição mais suave)
 *  - 404 tratado automaticamente (rota não renderiza se erro)
 */
export const taskResolver: ResolveFn<TaskApiResponse | undefined> = (route) => {
  const taskService = inject(TaskService);
  // Extrair ID da rota (ex: /tarefas/123 → id = 123)
  const id = Number(route.paramMap.get('id'));
  // Retornar Observable com dados da tarefa
  return taskService.getById(id);
};

