import { TaskQueryParams } from './types';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: TaskQueryParams) => [...taskKeys.lists(), params || {}] as const,
  calendar: (date?: string) => [...taskKeys.all, 'calendar', date || ''] as const,
  recommendation: () => [...taskKeys.all, 'recommendation'] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...taskKeys.details(), String(id)] as const,
};
