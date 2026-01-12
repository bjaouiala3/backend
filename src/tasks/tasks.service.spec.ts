import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let model: Model<TaskDocument>;

  const mockTask = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    createdAt: new Date(),
  };

  const mockTaskModel: any = jest.fn().mockImplementation((dto) => ({
    save: jest.fn().mockResolvedValue({ ...mockTask, ...dto }),
    ...dto,
  }));

  mockTaskModel.find = jest.fn();
  mockTaskModel.findById = jest.fn();
  mockTaskModel.findByIdAndUpdate = jest.fn();
  mockTaskModel.findByIdAndDelete = jest.fn();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    model = module.get<Model<TaskDocument>>(getModelToken(Task.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
      };

      const result = await service.create(createTaskDto);

      expect(mockTaskModel).toHaveBeenCalledWith(createTaskDto);
      expect(result).toMatchObject(createTaskDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const tasks = [mockTask];
      const findMock = {
        exec: jest.fn().mockResolvedValue(tasks),
      };
      mockTaskModel.find.mockReturnValue(findMock);

      const result = await service.findAll();

      expect(result).toEqual(tasks);
      expect(mockTaskModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      const findByIdMock = {
        exec: jest.fn().mockResolvedValue(mockTask),
      };
      mockTaskModel.findById.mockReturnValue(findByIdMock);

      const result = await service.findOne(mockTask._id);

      expect(result).toEqual(mockTask);
      expect(mockTaskModel.findById).toHaveBeenCalledWith(mockTask._id);
    });

    it('should throw NotFoundException when task not found', async () => {
      const findByIdMock = {
        exec: jest.fn().mockResolvedValue(null),
      };
      mockTaskModel.findById.mockReturnValue(findByIdMock);

      await expect(service.findOne(mockTask._id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.IN_PROGRESS,
      };
      const updatedTask = { ...mockTask, ...updateTaskDto };
      const findByIdAndUpdateMock = {
        exec: jest.fn().mockResolvedValue(updatedTask),
      };
      mockTaskModel.findByIdAndUpdate.mockReturnValue(findByIdAndUpdateMock);

      const result = await service.update(mockTask._id, updateTaskDto);

      expect(result).toEqual(updatedTask);
      expect(mockTaskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockTask._id,
        updateTaskDto,
        { new: true },
      );
    });

    it('should throw NotFoundException when task not found', async () => {
      const updateTaskDto: UpdateTaskDto = {
        status: TaskStatus.DONE,
      };
      const findByIdAndUpdateMock = {
        exec: jest.fn().mockResolvedValue(null),
      };
      mockTaskModel.findByIdAndUpdate.mockReturnValue(findByIdAndUpdateMock);

      await expect(service.update(mockTask._id, updateTaskDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      const findByIdAndDeleteMock = {
        exec: jest.fn().mockResolvedValue(mockTask),
      };
      mockTaskModel.findByIdAndDelete.mockReturnValue(findByIdAndDeleteMock);

      await service.remove(mockTask._id);

      expect(mockTaskModel.findByIdAndDelete).toHaveBeenCalledWith(mockTask._id);
    });

    it('should throw NotFoundException when task not found', async () => {
      const findByIdAndDeleteMock = {
        exec: jest.fn().mockResolvedValue(null),
      };
      mockTaskModel.findByIdAndDelete.mockReturnValue(findByIdAndDeleteMock);

      await expect(service.remove(mockTask._id)).rejects.toThrow(NotFoundException);
    });
  });
});

