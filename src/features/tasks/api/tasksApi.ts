import type { RootState } from '@/app/store';
import { teamApi } from '@/features/team/api/teamApi';
import { baseApi } from '@/shared/api/baseApi';
import {
  statusLabelFor,
  type CreateTaskInput,
  type TaskDto,
  type TaskListResponse,
  type TaskStatus,
  type UpdateTaskInput,
} from '@/shared-kernel';

export type GetMyTasksArgs = {
  status?: string;
  includeClosed?: boolean;
  page?: number;
  pageSize?: number;
};

function applyStatus(draft: TaskDto, status: TaskStatus) {
  draft.status = status;
  draft.statusLabel = statusLabelFor(status);
}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyTasks: build.query<TaskListResponse, GetMyTasksArgs | void>({
      query: (args) => {
        const params = new URLSearchParams({ scope: 'mine' });
        if (args?.status) params.set('status', args.status);
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
              'TaskList',
              ...result.data.map(({ id }) => ({ type: 'Task' as const, id })),
            ]
          : ['TaskList'],
    }),
    getTask: build.query<TaskDto, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),
    createTask: build.mutation<TaskDto, CreateTaskInput>({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TaskList', 'TeamTaskList'],
    }),
    updateTask: build.mutation<
      TaskDto,
      { id: string; patch: UpdateTaskInput }
    >({
      query: ({ id, patch }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id },
        'TaskList',
        'TeamTaskList',
      ],
      async onQueryStarted(
        { id, patch },
        { dispatch, queryFulfilled, getState },
      ) {
        if (patch.status == null) return;
        const status = patch.status;
        const state = getState() as RootState;
        const undos: Array<{ undo: () => void }> = [];

        undos.push(
          dispatch(
            tasksApi.util.updateQueryData('getTask', id, (draft) => {
              applyStatus(draft, status);
            }),
          ),
        );

        for (const arg of tasksApi.util.selectCachedArgsForQuery(
          state,
          'getMyTasks',
        )) {
          undos.push(
            dispatch(
              tasksApi.util.updateQueryData('getMyTasks', arg, (draft) => {
                const task = draft.data.find((item) => item.id === id);
                if (task) applyStatus(task, status);
              }),
            ),
          );
        }

        for (const arg of teamApi.util.selectCachedArgsForQuery(
          state,
          'getTeamTasks',
        )) {
          undos.push(
            dispatch(
              teamApi.util.updateQueryData('getTeamTasks', arg, (draft) => {
                const task = draft.data.find((item) => item.id === id);
                if (task) applyStatus(task, status);
              }),
            ),
          );
        }

        try {
          await queryFulfilled;
        } catch {
          for (const entry of undos) {
            entry.undo();
          }
        }
      },
    }),
    deleteTask: build.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Task', id },
        'TaskList',
        'TeamTaskList',
      ],
    }),
  }),
});

export const {
  useGetMyTasksQuery,
  useGetTaskQuery,
  useLazyGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
