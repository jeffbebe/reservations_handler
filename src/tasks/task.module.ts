import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSystemStoredFile, NestjsFormDataModule } from 'nestjs-form-data';
import { Task, TaskSchema } from 'src/database/schemas/task.schema';
import { BullMqModule } from 'src/queue/bull.module';
import { BullQueue } from 'src/queue/enums/bull-queue.enum';
import { ReservationModule } from 'src/reservation/reservation.module';
import { TaskConsumer } from './task.consumer';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  providers: [TaskService, TaskConsumer],
  controllers: [TaskController],
  imports: [
    NestjsFormDataModule.config({
      storage: FileSystemStoredFile,
      fileSystemStoragePath: './tmp',
    }),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    BullMqModule,
    BullModule.registerQueue({
      name: BullQueue.TASK_QUEUE,
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: true,
        delay: 1000,
        backoff: 1000,
      },
    }),
    ReservationModule,
    SharedModule,
  ],
})
export class TaskModule {}
