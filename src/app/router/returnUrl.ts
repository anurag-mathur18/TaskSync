/**
 * Allow only same-app relative paths for `?returnUrl=` (open-redirect safe).
 * Rejects protocol-relative (`//…`), absolute URLs, and backslash tricks.
 */
export function sanitizeReturnUrl(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;

  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  if (trimmed.includes('\\') || trimmed.includes('://')) return null;

  try {
    const parsed = new URL(trimmed, 'http://tasksync.local');
    if (parsed.origin !== 'http://tasksync.local') return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function buildLoginPath(returnUrl?: string | null): string {
  const safe = sanitizeReturnUrl(returnUrl ?? null);
  if (!safe || safe === '/login') return '/login';
  return `/login?returnUrl=${encodeURIComponent(safe)}`;
}
