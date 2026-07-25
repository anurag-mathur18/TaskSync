import { baseApi } from '@/shared/api/baseApi';
import type { TaskListResponse, UserSummary } from '@/shared-kernel';

export type GetTeamTasksArgs = {
  status?: string;
  ownerId?: string;
  includeClosed?: boolean;
  page?: number;
  pageSize?: number;
};

export const teamApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTeamTasks: build.query<TaskListResponse, GetTeamTasksArgs | void>({
      query: (args) => {
        const params = new URLSearchParams({ scope: 'team' });
        if (args?.status) params.set('status', args.status);
        if (args?.ownerId) params.set('ownerId', args.ownerId);
        if (args?.includeClosed != null) {
          params.set('includeClosed', String(args.includeClosed));
        }
        if (args?.page != null) params.set('page', String(args.page));
        if (args?.pageSize != null) {
          params.set('pageSize', String(args.pageSize));
        }
        return `/tasks?${params.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
              'TeamTaskList',
              ...result.data.map(({ id }) => ({ type: 'Task' as const, id })),
            ]
          : ['TeamTaskList'],
    }),
    getDirectReports: build.query<UserSummary[], string>({
      query: (managerId) => `/admin/managers/${managerId}/reports`,
      providesTags: ['Report'],
    }),
  }),
});

export const { useGetTeamTasksQuery, useGetDirectReportsQuery } = teamApi;
