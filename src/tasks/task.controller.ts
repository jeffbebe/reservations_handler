import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FormDataRequest } from 'nestjs-form-data';
import { UseApiKey } from 'src/common/api-key.decorator';
import { TaskService } from './task.service';
import { UploadDto } from './upload.dto';

@Controller('tasks')
@UseApiKey()
export class TaskController {
  constructor(private readonly tasksService: TaskService) {}

  @Post('upload')
  @FormDataRequest({
    cleanupAfterSuccessHandle: false,
  })
  async uploadFile(@Body() uploadDto: UploadDto) {
    return this.tasksService.handleTaskFileUpload(uploadDto);
  }

  @Get('status/:taskId')
  async getTask(@Param('taskId') taskId: string) {
    return this.tasksService.findOneOrThrow(taskId);
  }
}
