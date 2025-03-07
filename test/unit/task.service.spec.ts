import { UnprocessableEntityException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from '../../src/tasks/task.service';
import { DocumentChangeGateway } from '../../src/common/document-change.gateway';
import { Task } from '../../src/database/schemas/task.schema';

describe('TaskService', () => {
  let taskService: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken(Task.name),
          useValue: jest.fn(),
        },
        {
          provide: 'BullQueue_task_queue',
          useValue: {
            add: jest.fn(),
          },
        },
        { provide: DocumentChangeGateway, useValue: jest.fn() },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
  });

  describe('addTaskToQueue', () => {
    it('should add task to the queue', async () => {
      const spy = jest.spyOn(taskService['taskQueue'], 'add');

      await taskService['addTaskToQueue']('1', 'test.csv');

      expect(spy).toHaveBeenCalledWith('processTask', {
        taskId: '1',
        filePath: 'test.csv',
      });
    });

    it('should throw UnprocessableEntity if saving failed', async () => {
      const spy = jest.spyOn(taskService['taskQueue'], 'add');

      spy.mockImplementation(() => Promise.reject(new Error()));

      await expect(
        taskService['addTaskToQueue']('1', 'test.csv'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
