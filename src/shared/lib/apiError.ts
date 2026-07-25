import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

import { toast } from '@/shared/ui/organisms';

type ErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
  };
};

export type ApiErrorLike = FetchBaseQueryError | SerializedError | unknown;

function asFetchError(error: ApiErrorLike): FetchBaseQueryError | undefined {
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    (typeof (error as FetchBaseQueryError).status === 'number' ||
      typeof (error as FetchBaseQueryError).status === 'string')
  ) {
    return error as FetchBaseQueryError;
  }
  return undefined;
}

function envelopeMessage(data: unknown): string | undefined {
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object' && 'error' in data) {
    const message = (data as ErrorEnvelope).error?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return undefined;
}

/**
 * Map RTK Query / fetch errors to user-facing copy (FS72).
 * Prefers API envelope message; falls back by status.
 */
export function mapApiErrorToToast(
  error: ApiErrorLike,
  fallback = 'Something went wrong',
): string {
  const fetchError = asFetchError(error);

  if (fetchError) {
    const fromBody = envelopeMessage(fetchError.data);
    if (fromBody) return fromBody;

    if (fetchError.status === 'FETCH_ERROR') return 'Network error';
    if (fetchError.status === 'TIMEOUT_ERROR') return 'Request timed out';
    if (fetchError.status === 'PARSING_ERROR') return 'Unexpected response';

    if (typeof fetchError.status === 'number') {
      switch (fetchError.status) {
        case 401:
          return 'Session expired. Please sign in again.';
        case 403:
          return 'Access denied';
        case 404:
          return 'Not found';
        case 409:
          return 'Conflict — the resource was updated elsewhere.';
        case 422:
        case 400:
          return 'Invalid request';
        default:
          if (fetchError.status >= 500) return 'Server error. Try again later.';
      }
    }
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as SerializedError).message === 'string' &&
    (error as SerializedError).message
  ) {
    return (error as SerializedError).message!;
  }

  return fallback;
}

/** @deprecated Prefer `mapApiErrorToToast` — kept for existing call sites. */
export function getApiErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback = 'Something went wrong',
): string {
  return mapApiErrorToToast(error, fallback);
}

/** Show a sonner error toast from an RTK Query failure. */
export function toastApiError(
  error: ApiErrorLike,
  fallback?: string,
): string {
  const message = mapApiErrorToToast(error, fallback);
  toast.error(message);
  return message;
}
