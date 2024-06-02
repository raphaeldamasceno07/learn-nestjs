import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FindAllParameters, TaskDto } from './task.dto';

@Injectable()
export class TaskService {
  private tasks: TaskDto[] = [];

  create(task: TaskDto) {
    this.tasks.push(task);
    console.log(task);
  }

  findById(id: string): TaskDto {
    const foundTask = this.tasks.filter((t) => t.id === id);
    if (foundTask.length) {
      return foundTask[0];
    }
    throw new HttpException(
      `Task with id ${id} not found`,
      HttpStatus.NOT_FOUND,
    );
  }

  findAll(params: FindAllParameters): TaskDto[] {
    return this.tasks.filter((t) => {
      let match = true;

      if (params.title != undefined && !t.title.includes(params.title)) {
        match = false;
      }

      if (params.status != undefined && t.status !== params.status) {
        match = false;
      }

      return match;
    });
  }

  update(taskId: string, updatedTask: TaskDto) {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex >= 0) {
      this.tasks[taskIndex] = updatedTask;
      return;
    }

    throw new HttpException(
      `Task with id ${taskId} does not exist`,
      HttpStatus.NOT_FOUND,
    );
  }

  delete(id: string) {
    const deleteTask = this.tasks.findIndex((t) => t.id === id);

    if (deleteTask >= 0) {
      this.tasks.splice(deleteTask, 1);
      return;
    }
    throw new HttpException(
      `Task with id ${id} not found`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
