import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { saveGuard } from './save-guard';

describe('saveGuard', () => {
  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) =>
    TestBed.runInInjectionContext(() => saveGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
