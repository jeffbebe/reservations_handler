import { rmSync } from 'fs';
import { setTimeout } from 'timers/promises';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { TaskStatus } from 'src/database/schemas/task.schema';
import { BullQueue } from 'src/queue/enums/bull-queue.enum';
import { ReservationRow } from 'src/reservation/reservation-row.type';
import { ReservationService } from 'src/reservation/reservation.service';
import { readFile, utils } from 'xlsx';
import { TaskService } from './task.service';
import { TaskJob } from './types/task-job.type';

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

@Processor(BullQueue.TASK_QUEUE)
export class TaskConsumer extends WorkerHost {
  private readonly logger = new Logger('TaskProcessor');

  constructor(
    private readonly tasksService: TaskService,
    private readonly reservationService: ReservationService,
  ) {
    super();
  }

  async process(job: TaskJob): Promise<void> {
    try {
      const { filePath, taskId } = job.data;
      this.logger.log(
        `Processing job ${job.id} with task id ${taskId}. Attempts count: ${job.attemptsStarted}/${job.opts.attempts}`,
      );

      await setTimeout(5000);

      await this.tasksService.updateTaskStatus(taskId, TaskStatus.IN_PROGRESS);

      await setTimeout(5000);

      const workbook = readFile(filePath);

      if (!workbook.SheetNames.length) {
        throw new Error('No worksheet found in the workbook');
      }

      const worksheets = Object.values(workbook.Sheets);

      const sheetJsons = worksheets
        .map((it) => utils.sheet_to_json<ReservationRow>(it))
        .flat();

      const rows: { index: number; rowData: ReservationRow }[] = sheetJsons.map(
        (row, index) => ({ index: index + 2, rowData: row }),
      );

      const results = await Promise.allSettled(
        rows.map((row) =>
          this.reservationService.validateReservationsSchema(row),
        ),
      );

      const invalidRowsMessages: string[] = results
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason);

      if (invalidRowsMessages.length) {
        const error = new ValidationError(invalidRowsMessages.join(', '));
        await this.onFailed(taskId, error);
      }

      const validatedRows = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      await this.reservationService.processReservationRows(validatedRows);

      await this.onCompleted(taskId);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      this.logger.log(
        `Job ${job.id} failed unexpectedly. Reason: ${error.message}`,
      );
      await this.onFailed(
        job.data.taskId,
        new Error('Unexpected error. Please try again later.'),
      );
    } finally {
      this.cleanup(job.data.filePath, job);
    }
  }

  private async onFailed(taskId: string, error: Error) {
    const errorsReport = {
      issues: error.message,
      possibleFixes:
        error instanceof ValidationError
          ? 'Adjust data and send file once again.'
          : 'Please contact support.',
    };
    await this.tasksService.updateTaskStatus(
      taskId,
      TaskStatus.FAILED,
      errorsReport,
    );

    throw error;
  }

  private async onCompleted(taskId: string) {
    await this.tasksService.updateTaskStatus(taskId, TaskStatus.COMPLETED);
  }

  private async cleanup(filePath: string, job: Job) {
    if (job.attemptsStarted < (job.opts.attempts ?? 0)) {
      return;
    }
    try {
      rmSync(filePath);
    } catch (err) {
      this.logger.log('Removing file failed, reason: ', err);
    }
  }
}
