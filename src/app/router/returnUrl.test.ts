import { describe, expect, it } from 'vitest';

import {
  buildLoginPath,
  sanitizeReturnUrl,
} from '@/app/router/returnUrl';

describe('sanitizeReturnUrl', () => {
  it('allows relative app paths', () => {
    expect(sanitizeReturnUrl('/tasks')).toBe('/tasks');
    expect(sanitizeReturnUrl('/tasks/abc?x=1#y')).toBe('/tasks/abc?x=1#y');
  });

  it('rejects open redirects', () => {
    expect(sanitizeReturnUrl('https://evil.example/phish')).toBeNull();
    expect(sanitizeReturnUrl('//evil.example')).toBeNull();
    expect(sanitizeReturnUrl('/\\evil.example')).toBeNull();
    expect(sanitizeReturnUrl('javascript:alert(1)')).toBeNull();
  });

  it('rejects empty and non-strings', () => {
    expect(sanitizeReturnUrl('')).toBeNull();
    expect(sanitizeReturnUrl(null)).toBeNull();
    expect(sanitizeReturnUrl(undefined)).toBeNull();
  });
});

describe('buildLoginPath', () => {
  it('omits unsafe or login returnUrls', () => {
    expect(buildLoginPath(null)).toBe('/login');
    expect(buildLoginPath('/login')).toBe('/login');
    expect(buildLoginPath('https://evil.example')).toBe('/login');
  });

  it('encodes a safe returnUrl', () => {
    expect(buildLoginPath('/tasks/1')).toBe(
      `/login?returnUrl=${encodeURIComponent('/tasks/1')}`,
    );
  });
});
