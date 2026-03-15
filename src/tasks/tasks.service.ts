import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role, Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly taskInclude = {
    assignee: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
    createdBy: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    },
  } satisfies Prisma.TaskInclude;

  async create(createTaskDto: CreateTaskDto, user: RequestUser) {
    await this.ensureAssigneeExists(createTaskDto.assigneeId);

    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        deadline: new Date(createTaskDto.deadline),
        assigneeId: createTaskDto.assigneeId,
        createdById: user.userId,
      },
      include: this.taskInclude,
    });
  }

  async findAll(user: RequestUser) {
    return this.prisma.task.findMany({
      where: user.role === Role.ADMIN ? {} : { assigneeId: user.userId },
      orderBy: { createdAt: 'desc' },
      include: this.taskInclude,
    });
  }

  async findOne(id: number, user: RequestUser) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: this.taskInclude,
    });

    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    if (user.role !== Role.ADMIN && task.assigneeId !== user.userId) {
      throw new ForbiddenException('You can only access your assigned tasks.');
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    await this.ensureTaskExists(id);

    if (updateTaskDto.assigneeId) {
      await this.ensureAssigneeExists(updateTaskDto.assigneeId);
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        title: updateTaskDto.title,
        description: updateTaskDto.description,
        status: updateTaskDto.status,
        deadline: updateTaskDto.deadline
          ? new Date(updateTaskDto.deadline)
          : undefined,
        assignee: updateTaskDto.assigneeId
          ? { connect: { id: updateTaskDto.assigneeId } }
          : undefined,
      },
      include: this.taskInclude,
    });
  }

  async updateStatus(
    id: number,
    updateTaskStatusDto: UpdateTaskStatusDto,
    user: RequestUser,
  ) {
    const task = await this.ensureTaskExists(id);

    if (user.role !== Role.ADMIN && task.assigneeId !== user.userId) {
      throw new ForbiddenException('You can only update your assigned tasks.');
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: updateTaskStatusDto.status,
      },
      include: this.taskInclude,
    });
  }

  async remove(id: number) {
    await this.ensureTaskExists(id);
    await this.prisma.task.delete({ where: { id } });

    return { message: 'Task deleted successfully.' };
  }

  private async ensureTaskExists(id: number): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) {
      throw new NotFoundException('Task not found.');
    }

    return task;
  }

  private async ensureAssigneeExists(assigneeId: number): Promise<void> {
    const assignee = await this.prisma.user.findUnique({
      where: { id: assigneeId },
    });
    if (!assignee) {
      throw new NotFoundException('Assignee not found.');
    }
  }
}
