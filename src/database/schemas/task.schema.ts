import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';
import { HydratedDocument } from 'mongoose';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
  @Expose()
  @Prop({ required: true, enum: TaskStatus })
  status: TaskStatus;

  @Expose()
  @Prop({ required: true })
  filePath: string;

  @Expose()
  @Prop({ required: true, type: Date, default: Date.now() })
  createdAt: Date;

  @Expose()
  @Prop({ type: Object })
  errorsReport?: Record<string, unknown>;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
