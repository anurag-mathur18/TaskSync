import { http, HttpResponse } from 'msw';

import { findUserByEmail } from '@/mocks/db';
import {
  apiError,
  createAccessToken,
  getBearerToken,
  requireActor,
  revokeToken,
  toUserDto,
} from '@/mocks/http';
import { loginSchema } from '@/shared-kernel';

const API = '/api/v1';

export const authHandlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const json: unknown = await request.json();
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return apiError(400, 'VALIDATION_ERROR', 'Invalid login payload.', {
        issues: parsed.error.issues,
      });
    }

    const user = findUserByEmail(parsed.data.email);
    if (!user || user.password !== parsed.data.password) {
      return apiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const accessToken = createAccessToken(user.id);
    return HttpResponse.json({
      user: toUserDto(user),
      accessToken,
    });
  }),

  http.post(`${API}/auth/logout`, ({ request }) => {
    revokeToken(getBearerToken(request));
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/auth/me`, ({ request }) => {
    const auth = requireActor(request);
    if (auth instanceof Response) return auth;
    return HttpResponse.json(toUserDto(auth.user));
  }),
];
