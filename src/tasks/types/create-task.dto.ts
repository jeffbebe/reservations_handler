import { PickType } from '@nestjs/swagger';
import { Task } from 'src/database/schemas/task.schema';

export class CreateTaskDto extends PickType(Task, ['filePath'] as const) {}
