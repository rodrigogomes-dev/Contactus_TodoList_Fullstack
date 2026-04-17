import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGuard, HasUnsavedChanges } from './save-guard';

describe('saveGuard', () => {
  let mockComponent: HasUnsavedChanges;

  beforeEach(() => {
    // Mock window.confirm
    vi.stubGlobal('confirm', vi.fn());
  });

  it('should allow deactivation when component has no unsaved changes', () => {
    mockComponent = { isDirty: false };

    const result = saveGuard(mockComponent, {} as any, {} as any, {} as any);

    expect(result).toBe(true);
  });

  it('should prompt user when component has unsaved changes', () => {
    mockComponent = { isDirty: true };
    (window.confirm as any).mockReturnValue(true);

    const result = saveGuard(mockComponent, {} as any, {} as any, {} as any);

    expect(window.confirm).toHaveBeenCalledWith('Tens alterações não guardadas. Sair mesmo assim?');
    expect(result).toBe(true);
  });

  it('should prevent deactivation when user cancels confirmation', () => {
    mockComponent = { isDirty: true };
    (window.confirm as any).mockReturnValue(false);

    const result = saveGuard(mockComponent, {} as any, {} as any, {} as any);

    expect(window.confirm).toHaveBeenCalledWith('Tens alterações não guardadas. Sair mesmo assim?');
    expect(result).toBe(false);
  });

  it('should not prompt when isDirty is false even if confirm is mocked', () => {
    mockComponent = { isDirty: false };

    saveGuard(mockComponent, {} as any, {} as any, {} as any);

    expect(window.confirm).not.toHaveBeenCalled();
  });
});
