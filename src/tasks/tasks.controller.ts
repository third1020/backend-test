import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, TaskFilterDto } from './dto/create-task.dto';
import { TaskStatus, Priority } from './entities/task.entity';
import type { TaskStatsResponse } from './interfaces/task-response.interface';


@Controller('tasks')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  
  // POST /tasks - สร้างงานใหม่
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  // GET /tasks - ดูรายการงานทั้งหมด
  @Get()
  findAll(@Query() filterDto?: TaskFilterDto) {
    return this.tasksService.findAll(filterDto);
  }

  // GET /tasks/:id - ดูงานรายการเดียว
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // PATCH /tasks/:id - อัพเดทงาน
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  // DELETE /tasks/:id - ลบงาน
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }


  // GET /tasks/stats - ดูสถิติงาน
  @Get('stats')
  getStats(): TaskStatsResponse {
    return this.tasksService.getStats();
  }

  // GET /tasks/overdue - ดูงานที่เกินกำหนด
  @Get('overdue')
  findOverdue() {
    return this.tasksService.findOverdue();
  }

  // GET /tasks/status/:status - ดูงานตามสถานะ
  @Get('status/:status')
  findByStatus(@Param('status') status: TaskStatus) {
    return this.tasksService.findByStatus(status);
  }

  // GET /tasks/priority/:priority - ดูงานตามความสำคัญ
  @Get('priority/:priority')
  findByPriority(@Param('priority') priority: Priority) {
    return this.tasksService.findByPriority(priority);
  }

  // PATCH /tasks/:id/complete - เปลี่ยนสถานะเป็นเสร็จสิ้น
  @Patch(':id/complete')
  markAsCompleted(@Param('id') id: string) {
    return this.tasksService.markAsCompleted(id);
  }

  // PATCH /tasks/:id/in-progress - เปลี่ยนสถานะเป็นกำลังดำเนินการ
  @Patch(':id/in-progress')
  markAsInProgress(@Param('id') id: string) {
    return this.tasksService.markAsInProgress(id);
  }

  // PATCH /tasks/:id/pending - เปลี่ยนสถานะเป็นรอดำเนินการ
  @Patch(':id/pending')
  markAsPending(@Param('id') id: string) {
    return this.tasksService.markAsPending(id);
  }
}
