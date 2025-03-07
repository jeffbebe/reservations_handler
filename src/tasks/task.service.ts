import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import {
  Task,
  TaskDocument,
  TaskStatus,
} from 'src/database/schemas/task.schema';
import { BullQueue } from 'src/queue/enums/bull-queue.enum';
import { CreateTaskDto } from './types/create-task.dto';
import { UploadDto } from './upload.dto';
import { DocumentChangeGateway } from '../common/document-change.gateway';

@Injectable()
export class TaskService implements OnModuleInit {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectQueue(BullQueue.TASK_QUEUE) private taskQueue: Queue,
    private readonly documentChangeGateway: DocumentChangeGateway,
  ) {}

  public async handleTaskFileUpload(uploadDto: UploadDto) {
    const filePath = uploadDto.file.path;
    const taskId = await this.saveTask({ filePath });
    await this.addTaskToQueue(taskId, filePath);
    return taskId;
  }

  public async findOneOrThrow(id: string): Promise<Task> {
    try {
      const doc = await this.taskModel.findById(id);

      if (!doc) {
        throw new NotFoundException(`Task with id ${id} not found`);
      }

      return doc;
    } catch {
      throw new BadRequestException('Invalid task id');
    }
  }

  public async updateTaskStatus(
    taskId: string,
    status: Task['status'],
    errorsReport?: Task['errorsReport'],
  ) {
    try {
      await this.taskModel.updateOne({ _id: taskId }, { status, errorsReport });
    } catch {
      throw new UnprocessableEntityException(
        'Failed to update task status. Check request and try again.',
      );
    }
  }

  private async addTaskToQueue(taskId: string, filePath: string) {
    try {
      await this.taskQueue.add('processTask', { taskId, filePath });
    } catch {
      throw new UnprocessableEntityException(
        'Failed to add task to queue. Check request and try again.',
      );
    }
  }

  onModuleInit() {
    this.streamReservationChanges();
  }

  private streamReservationChanges() {
    const changeStream = this.taskModel.watch([], {
      fullDocument: 'updateLookup',
    });
    changeStream.on('change', (change: { fullDocument: TaskDocument }) => {
      const doc = change.fullDocument;
      const { status, errorsReport } = doc;
      this.documentChangeGateway.notifyAboutDocumentChange(doc._id.toString(), {
        status,
        errorsReport,
      });
    });
  }

  private async saveTask(payload: CreateTaskDto): Promise<string> {
    try {
      const doc = await this.taskModel.create({
        status: TaskStatus.PENDING,
        filePath: payload.filePath,
      });

      return doc._id.toString();
    } catch {
      throw new UnprocessableEntityException(
        'Failed to save task. Check request and try again.',
      );
    }
  }
}
