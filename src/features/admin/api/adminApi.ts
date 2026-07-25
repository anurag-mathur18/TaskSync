import { baseApi } from '@/shared/api/baseApi';
import type {
  AdminUserDto,
  SetManagerInput,
  UpdateRolesInput,
} from '@/shared-kernel';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAdminUsers: build.query<AdminUserDto[], void>({
      query: () => '/admin/users',
      providesTags: ['AdminUser'],
    }),
    updateUserRoles: build.mutation<
      AdminUserDto,
      { id: string; body: UpdateRolesInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}/roles`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['AdminUser', 'Me'],
    }),
    setUserManager: build.mutation<
      AdminUserDto,
      { id: string; body: SetManagerInput }
    >({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}/manager`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['AdminUser', 'Report', 'TeamTaskList'],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useUpdateUserRolesMutation,
  useSetUserManagerMutation,
} = adminApi;
