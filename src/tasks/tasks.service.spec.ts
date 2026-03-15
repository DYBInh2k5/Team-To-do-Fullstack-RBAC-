import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role, TaskStatus } from '@prisma/client';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestUser } from '../auth/interfaces/request-user.interface';

const adminUser: RequestUser = {
  userId: 1,
  email: 'admin@test.com',
  role: Role.ADMIN,
};

const memberUser: RequestUser = {
  userId: 2,
  email: 'bob@test.com',
  role: Role.MEMBER,
};

const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'A test task',
  deadline: new Date('2026-12-31'),
  status: TaskStatus.TODO,
  assigneeId: memberUser.userId,
  createdById: adminUser.userId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAssignee = {
  id: memberUser.userId,
  email: memberUser.email,
  name: 'Bob Smith',
  role: Role.MEMBER,
};

describe('TasksService', () => {
  let service: TasksService;
  let prisma: {
    task: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  // -----------------------------------------------------------------------
  // create
  // -----------------------------------------------------------------------
  describe('create', () => {
    it('should create a task and return it', async () => {
      prisma.user.findUnique.mockResolvedValue(mockAssignee);
      prisma.task.create.mockResolvedValue({
        ...mockTask,
        assignee: mockAssignee,
        createdBy: {
          id: 1,
          name: 'Alice',
          email: 'admin@test.com',
          role: Role.ADMIN,
        },
      });

      const result = await service.create(
        {
          title: 'Test Task',
          deadline: '2026-12-31T00:00:00Z',
          assigneeId: memberUser.userId,
        },
        adminUser,
      );

      expect(result.title).toBe('Test Task');
      expect(prisma.task.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if assignee does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create(
          {
            title: 'Test Task',
            deadline: '2026-12-31T00:00:00Z',
            assigneeId: 999,
          },
          adminUser,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // -----------------------------------------------------------------------
  // findAll
  // -----------------------------------------------------------------------
  describe('findAll', () => {
    it('admin should see all tasks (empty where clause)', async () => {
      prisma.task.findMany.mockResolvedValue([mockTask]);

      const result = await service.findAll(adminUser);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
      expect(result).toHaveLength(1);
    });

    it('member should see only assigned tasks', async () => {
      prisma.task.findMany.mockResolvedValue([mockTask]);

      await service.findAll(memberUser);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { assigneeId: memberUser.userId } }),
      );
    });
  });

  // -----------------------------------------------------------------------
  // findOne
  // -----------------------------------------------------------------------
  describe('findOne', () => {
    it('should throw NotFoundException if task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, adminUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('admin can access any task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask as any);

      const result = await service.findOne(1, adminUser);

      expect(result).toBeDefined();
    });

    it('member can access own assigned task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask as any);

      const result = await service.findOne(1, memberUser);

      expect(result).toBeDefined();
    });

    it("member cannot access another member's task", async () => {
      prisma.task.findUnique.mockResolvedValue({
        ...mockTask,
        assigneeId: 99,
      } as any);

      await expect(service.findOne(1, memberUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // -----------------------------------------------------------------------
  // updateStatus
  // -----------------------------------------------------------------------
  describe('updateStatus', () => {
    it('member can update status of own task', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask as any);
      prisma.task.update.mockResolvedValue({
        ...mockTask,
        status: TaskStatus.IN_PROGRESS,
      } as any);

      const result = await service.updateStatus(
        1,
        { status: TaskStatus.IN_PROGRESS },
        memberUser,
      );

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it("member cannot update status of another member's task", async () => {
      prisma.task.findUnique.mockResolvedValue({
        ...mockTask,
        assigneeId: 99,
      } as any);

      await expect(
        service.updateStatus(1, { status: TaskStatus.DONE }, memberUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('admin can update status of any task', async () => {
      prisma.task.findUnique.mockResolvedValue({
        ...mockTask,
        assigneeId: 99,
      } as any);
      prisma.task.update.mockResolvedValue({
        ...mockTask,
        status: TaskStatus.DONE,
      } as any);

      const result = await service.updateStatus(
        1,
        { status: TaskStatus.DONE },
        adminUser,
      );

      expect(result.status).toBe(TaskStatus.DONE);
    });
  });

  // -----------------------------------------------------------------------
  // remove
  // -----------------------------------------------------------------------
  describe('remove', () => {
    it('should delete a task and return success message', async () => {
      prisma.task.findUnique.mockResolvedValue(mockTask as any);
      prisma.task.delete.mockResolvedValue(mockTask as any);

      const result = await service.remove(1);

      expect(result.message).toContain('deleted');
      expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
