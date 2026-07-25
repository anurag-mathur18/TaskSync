import { adminHandlers } from '@/mocks/handlers/adminHandlers';
import { authHandlers } from '@/mocks/handlers/authHandlers';
import { taskHandlers } from '@/mocks/handlers/taskHandlers';

export const handlers = [...authHandlers, ...taskHandlers, ...adminHandlers];
