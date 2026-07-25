/**
 * RTK Query cache tag contract (FS19).
 *
 * | Tag            | Used by                                      |
 * | -------------- | -------------------------------------------- |
 * | Me             | getMe                                        |
 * | Task           | getTask by id (`{ type: 'Task', id }`)       |
 * | TaskList       | getMyTasks                                   |
 * | TeamTaskList   | getTeamTasks                                 |
 * | AdminUser      | getAdminUsers                                |
 * | Report         | getDirectReports                             |
 */
export const API_TAG_TYPES = [
  'Me',
  'Task',
  'TaskList',
  'TeamTaskList',
  'AdminUser',
  'Report',
] as const;

export type ApiTagType = (typeof API_TAG_TYPES)[number];
