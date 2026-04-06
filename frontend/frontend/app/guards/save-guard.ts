import { CanDeactivateFn } from '@angular/router';

export interface HasUnsavedChanges {
  isDirty: boolean;
}

export const saveGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.isDirty) {
    return window.confirm('Tens alterações não guardadas. Sair mesmo assim?');
  }
  return true;
};

