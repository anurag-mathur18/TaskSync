import { clearCredentials, setCredentials } from '@/app/store/authSlice';
import { baseApi } from '@/shared/api/baseApi';
import type { LoginInput, LoginResponse, UserDto } from '@/shared-kernel';

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMe: build.query<UserDto, void>({
      query: () => '/auth/me',
      providesTags: ['Me'],
      keepUnusedDataFor: 300,
    }),
    login: build.mutation<LoginResponse, LoginInput>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ accessToken: data.accessToken }));
        } catch {
          // Leave credentials untouched on failure.
        }
      },
    }),
    logout: build.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
} = authApi;
