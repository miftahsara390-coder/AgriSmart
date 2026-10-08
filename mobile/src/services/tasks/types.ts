export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskCropRef {
  id: string | number;
  name: string;
  location?: string;
}

export interface Task {
  id: string | number;
  title: string;
  description?: string;
  type?: string;
  status: TaskStatus | string;
  priority?: TaskPriority | string;
  date?: string;
  dueDate?: string;
  time?: string;
  completed?: boolean;
  reminder?: boolean;
  cropId?: string | number;
  Crop?: TaskCropRef;
  cropField?: string;
  userId?: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskQueryParams {
  status?: string;
  cropId?: string | number;
  from?: string;
  to?: string;
}

export interface CalendarTasksResponse {
  date: string;
  tasks: Task[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  date?: string;
  dueDate?: string;
  time?: string;
  cropId?: string | number;
  reminder?: boolean;
  completed?: boolean;
  status?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {}

export interface TaskRecommendationResponse {
  recommendations?: any[];
  [key: string]: any;
}
