import { describe, expect, it } from 'vitest';

import { cn } from './cn';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('resolves Tailwind conflicts with the last winning', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('ignores falsy values', () => {
    const hidden = false;
    expect(cn('text-primary', hidden && 'hidden', undefined, null, 'font-body')).toBe(
      'text-primary font-body',
    );
  });
});
