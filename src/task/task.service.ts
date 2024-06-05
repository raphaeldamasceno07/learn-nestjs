import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from 'src/db/entities/task.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/db/entities/user.entity';
import { FindAllParameters, TaskDto, TaskStatusEnum } from './task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  async create(task: TaskDto) {
    const taskToSave: TaskEntity = {
      title: task.title,
      description: task.description,
      expirationDate: task.expirationDate,
      status: TaskStatusEnum.TO_DO,
      userId: '',
      user: new UserEntity
    };

    const createdTask = await this.taskRepository.save(taskToSave);

    console.log(createdTask);

    const newTask = this.mapEntityToDo(createdTask);

    console.log(newTask.status);

    return newTask;
  }

  async findById(id: string): Promise<TaskDto> {
    const foundTask = await this.taskRepository.findOne({ where: { id } });

    if (!foundTask) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return this.mapEntityToDo(foundTask);
  }

  async findAll(params: FindAllParameters): Promise<TaskDto[]> {
    const queryBuilder = this.taskRepository.createQueryBuilder('task');

    if (params.title) {
      const trimmedTitle = params.title.trim().toLowerCase();
      queryBuilder.andWhere('LOWER(TRIM(task.title)) LIKE :title', {
        title: `%${trimmedTitle}%`,
      });
    }

    if (params.status) {
      const trimmedStatus = params.status.trim().toLowerCase();
      queryBuilder.andWhere('LOWER(TRIM(task.status::text)) LIKE :status', {
        status: `%${trimmedStatus}%`,
      });
    }

    const tasksfound = await queryBuilder.getMany();

    const allTasks = tasksfound.map((taskEntity) =>
      this.mapEntityToDo(taskEntity),
    );

    return allTasks;
  }

  async update(id: string, updateTask: TaskDto) {
    const foundTask = await this.taskRepository.findOne({ where: { id } });

    if (!foundTask) {
      throw new NotFoundException(`Task with id ${id} does not exist`);
    }

    await this.taskRepository.update(id, this.mapDtoToEntity(updateTask));
  }

  async delete(id: string) {
    const result = await this.taskRepository.delete(id);

    if (!result.affected) {
      throw new BadRequestException(`Task with id ${id} not found`);
    }
  }

  private mapEntityToDo(taskEntity: TaskEntity): TaskDto {
    return {
      id: taskEntity.id,
      title: taskEntity.title,
      description: taskEntity.description,
      expirationDate: taskEntity.expirationDate,
      status: taskEntity.status,
    };
  }

  private mapDtoToEntity(taskDto: TaskDto): Partial<TaskEntity> {
    return {
      title: taskDto.title,
      description: taskDto.description,
      expirationDate: taskDto.expirationDate,
      status: taskDto.status.toString(),
    };
  }
}
