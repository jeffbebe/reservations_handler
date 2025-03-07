import { Job } from 'bullmq';

export type TaskJob = Job<
  { taskId: string; filePath: string },
  unknown,
  string
>;
