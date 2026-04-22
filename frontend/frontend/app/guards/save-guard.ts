import { CanDeactivateFn } from '@angular/router';

/**
 * Interface: HasUnsavedChanges
 * Componente deve implementar isto se quer usar saveGuard.
 * 
 * Exemplo:
 *  class EditTaskComponent implements HasUnsavedChanges {
 *    isDirty = false;
 *  }
 */
export interface HasUnsavedChanges {
  isDirty: boolean;  // true = há alterações não guardadas
}

/**
 * Guard: saveGuard
 * Proteção de desnavegação com aviso de alterações não guardadas.
 * 
 * Uso em rotas (canDeactivate):
 *  { path: 'edit/:id', component: EditTaskComponent, canDeactivate: [saveGuard] }
 * 
 * Fluxo:
 *  1. Utilizador tenta navegar para outro componente
 *  2. saveGuard verifica component.isDirty
 *  3. Se isDirty = true, mostra confirm dialog
 *  4. Se utilizador clica "Sim", permite navegação
 *  5. Se utilizador clica "Não", fica na página
 */
export const saveGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.isDirty) {
    // Pedir confirmação se há alterações
    return window.confirm('Tens alterações não guardadas. Sair mesmo assim?');
  }
  // Sem alterações → permitir navegação
  return true;
};

