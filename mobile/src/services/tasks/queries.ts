import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { tasksApi } from './apis';
import { taskKeys } from './keys';
import {
  CalendarTasksResponse,
  Task,
  TaskQueryParams,
  TaskRecommendationResponse,
} from './types';

export const useTasksQuery = (
  params?: TaskQueryParams,
  options?: Omit<UseQueryOptions<{ tasks: Task[] }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => tasksApi.getAll(params),
    ...options,
  });
};

export const useCalendarTasksQuery = (
  date: string,
  options?: Omit<UseQueryOptions<CalendarTasksResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: taskKeys.calendar(date),
    queryFn: () => tasksApi.getCalendar(date),
    enabled: !!date,
    ...options,
  });
};

export const useTaskRecommendationQuery = (
  options?: Omit<UseQueryOptions<TaskRecommendationResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: taskKeys.recommendation(),
    queryFn: () => tasksApi.getRecommendation(),
    ...options,
  });
};

export const useTaskQuery = (
  id: string | number | undefined,
  options?: Omit<UseQueryOptions<{ task: Task }, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: taskKeys.detail(id || ''),
    queryFn: () => tasksApi.getById(id!),
    enabled: !!id,
    ...options,
  });
};
