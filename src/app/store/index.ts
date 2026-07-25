import { configureStore } from '@reduxjs/toolkit';

import { authReducer } from '@/app/store/authSlice';
import { baseApi } from '@/shared/api/baseApi';

import '@/features/auth/api/authApi';
import '@/features/tasks/api/tasksApi';
import '@/features/team/api/teamApi';
import '@/features/admin/api/adminApi';

export function setupStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
}

export const store = setupStore();

export type AppStore = ReturnType<typeof setupStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
