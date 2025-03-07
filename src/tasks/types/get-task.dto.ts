import { PickType } from '@nestjs/swagger';
import { Task } from '../../database/schemas/task.schema';

export class GetTaskDto extends PickType(Task, [
  'createdAt',
  'status',
  'errorsReport',
]) {}
