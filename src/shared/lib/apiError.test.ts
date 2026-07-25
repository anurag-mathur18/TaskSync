import { describe, expect, it } from 'vitest';

import { mapApiErrorToToast } from '@/shared/lib/apiError';

describe('mapApiErrorToToast', () => {
  it('prefers API envelope message', () => {
    expect(
      mapApiErrorToToast({
        status: 409,
        data: { error: { code: 'LAST_ADMIN', message: 'Cannot remove the last Admin role.' } },
      }),
    ).toBe('Cannot remove the last Admin role.');
  });

  it('maps status codes when envelope is missing', () => {
    expect(mapApiErrorToToast({ status: 403, data: undefined })).toBe(
      'Access denied',
    );
    expect(mapApiErrorToToast({ status: 404, data: undefined })).toBe(
      'Not found',
    );
    expect(mapApiErrorToToast({ status: 409, data: undefined })).toBe(
      'Conflict — the resource was updated elsewhere.',
    );
    expect(mapApiErrorToToast({ status: 'FETCH_ERROR', error: 'Failed' })).toBe(
      'Network error',
    );
  });

  it('uses fallback for unknown errors', () => {
    expect(mapApiErrorToToast(undefined, 'Could not save')).toBe(
      'Could not save',
    );
  });
});
