import { AbstractControl, ValidationErrors } from '@angular/forms';

export function dateNotInPastValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(control.value);
  selected.setHours(0, 0, 0, 0);
  return selected >= today ? null : { dateInPast: true };
}