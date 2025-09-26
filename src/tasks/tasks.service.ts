import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from './dto/create-task.dto';
import { Task, TaskStatus, Priority } from './entities/task.entity';
import { tasks } from '../database/tasks.db';

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  completionRate: number;
}

const PRIORITY_ORDER = {
  [Priority.LOW]: 1,
  [Priority.MEDIUM]: 2,
  [Priority.HIGH]: 3,
} as const;

const DEFAULT_SORT_BY = 'createdAt';
const DEFAULT_SORT_ORDER = 'desc';

@Injectable()
export class TasksService {
  create(createTaskDto: CreateTaskDto): Task {
    const now = new Date();
    const newTask: Task = {
      id: uuidv4(),
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status ?? TaskStatus.PENDING,
      priority: createTaskDto.priority ?? Priority.MEDIUM,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    tasks.push(newTask);
    return newTask;
  }

  findAll(filterDto?: TaskFilterDto): Task[] {
    if (!filterDto) {
      return [...tasks];
    }
    return this.applyFiltersAndSort(tasks, filterDto);
  }

  findOne(id: string): Task {
    const task = tasks.find(task => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  update(id: string, updateTaskDto: UpdateTaskDto): Task {
    const taskIndex = this.findTaskIndex(id);
    const existingTask = tasks[taskIndex];
    
    const updatedTask: Task = {
      ...existingTask,
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : existingTask.dueDate,
      completedAt: this.calculateCompletedAt(existingTask, updateTaskDto),
      updatedAt: new Date(),
    };

    tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  remove(id: string): void {
    const taskIndex = this.findTaskIndex(id);
    tasks.splice(taskIndex, 1);
  }

  findByStatus(status: TaskStatus): Task[] {
    return tasks.filter(task => task.status === status);
  }

  findByPriority(priority: Priority): Task[] {
    return tasks.filter(task => task.priority === priority);
  }

  findOverdue(): Task[] {
    const now = new Date();
    return tasks.filter(task => 
      task.dueDate && 
      task.dueDate < now && 
      task.status !== TaskStatus.COMPLETED
    );
  }

  getStats(): TaskStats {
    const completed = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const total = tasks.length;
    
    return {
      total,
      completed,
      pending: tasks.filter(task => task.status === TaskStatus.PENDING).length,
      inProgress: tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  markAsCompleted(id: string): Task {
    const now = new Date();
    const task = this.findOne(id);
    task.status = TaskStatus.COMPLETED;
    task.completedAt = now;
    task.updatedAt = now;
    return task;
  }

  markAsInProgress(id: string): Task {
    return this.update(id, { status: TaskStatus.IN_PROGRESS });
  }

  markAsPending(id: string): Task {
    return this.update(id, { status: TaskStatus.PENDING });
  }

  private applyFiltersAndSort(tasks: Task[], filterDto: TaskFilterDto): Task[] {
    let filteredTasks = [...tasks];

    if (filterDto.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filterDto.status);
    }

    if (filterDto.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filterDto.priority);
    }

    if (filterDto.search) {
      const searchTerm = filterDto.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description?.toLowerCase().includes(searchTerm))
      );
    }

    if (filterDto.isOverdue) {
      const now = new Date();
      filteredTasks = filteredTasks.filter(task => 
        task.dueDate && 
        task.dueDate < now && 
        task.status !== TaskStatus.COMPLETED
      );
    }

    return this.sortTasks(filteredTasks, filterDto.sortBy, filterDto.sortOrder);
  }

  private sortTasks(tasks: Task[], sortBy?: string, sortOrder?: string): Task[] {
    const sortField = sortBy ?? DEFAULT_SORT_BY;
    const order = sortOrder ?? DEFAULT_SORT_ORDER;

    return tasks.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'dueDate':
          comparison = this.compareDates(a.dueDate, b.dueDate);
          break;
        case 'priority':
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        default:
          comparison = 0;
      }

      return order === 'asc' ? comparison : -comparison;
    });
  }

  private compareDates(dateA: Date | null | undefined, dateB: Date | null | undefined): number {
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA.getTime() - dateB.getTime();
  }

  private findTaskIndex(id: string): number {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex === -1) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return taskIndex;
  }

  private calculateCompletedAt(existingTask: Task, updateTaskDto: UpdateTaskDto): Date | null {
    if (updateTaskDto.status === TaskStatus.COMPLETED && existingTask.status !== TaskStatus.COMPLETED) {
      return new Date();
    }
    return existingTask.completedAt ?? null;
  }
}
