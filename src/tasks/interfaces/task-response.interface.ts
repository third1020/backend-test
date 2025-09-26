import { TaskStatus, Priority } from '../entities/task.entity';

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStatsResponse {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  completionRate: number;
}

export interface TaskListResponse {
  tasks: TaskResponse[];
  total: number;
  page?: number;
  limit?: number;
}
