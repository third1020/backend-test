import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsDateString, 
  IsBoolean, 
  IsNotEmpty, 
  MinLength, 
  MaxLength,
  Matches 
} from 'class-validator';
import { TaskStatus, Priority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsEnum(TaskStatus, { message: 'Status must be one of: pending, in_progress, completed' })
  @IsOptional()
  status?: TaskStatus = TaskStatus.PENDING;

  @IsEnum(Priority, { message: 'Priority must be one of: low, medium, high' })
  @IsOptional()
  priority?: Priority = Priority.MEDIUM;

  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  @IsOptional()
  dueDate?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsEnum(TaskStatus, { message: 'Status must be one of: pending, in_progress, completed' })
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(Priority, { message: 'Priority must be one of: low, medium, high' })
  @IsOptional()
  priority?: Priority;

  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  @IsOptional()
  dueDate?: string;
}

export class TaskFilterDto {
  @IsEnum(TaskStatus, { message: 'Status must be one of: pending, in_progress, completed' })
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(Priority, { message: 'Priority must be one of: low, medium, high' })
  @IsOptional()
  priority?: Priority;

  @IsString()
  @IsOptional()
  @MinLength(1, { message: 'Search term must be at least 1 character long' })
  @MaxLength(100, { message: 'Search term must not exceed 100 characters' })
  search?: string;

  @IsBoolean()
  @IsOptional()
  isOverdue?: boolean;

  @IsString()
  @IsOptional()
  @Matches(/^(createdAt|updatedAt|dueDate|priority|title)$/, { 
    message: 'Sort by must be one of: createdAt, updatedAt, dueDate, priority, title' 
  })
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';

  @IsEnum(['asc', 'desc'], { message: 'Sort order must be either asc or desc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
