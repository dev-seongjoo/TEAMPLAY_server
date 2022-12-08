import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../project/entities/project.entity';
import { ProjectMember } from '../project/entities/projectMember.entity';
import { User } from '../user/entities/user.entity';
import { Task, TASK_TYPE_ENUM } from './entities/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    // @InjectRepository(ProjectMember)
    // private readonly projectMemberRepository: Repository<ProjectMember>,
  ) {}

  async findAll({ projectId }) {
    return await this.taskRepository.find({ project: projectId });
  }

  async findOne({ taskId }) {
    return await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['users'],
    });
  }

  async create({ projectId, writerId, content, limit, taskType, userIds }) {
    const users = await Promise.all(
      userIds.map(id => {
        return this.userRepository.findOne({ id });
      }),
    );
    const user = await this.userRepository.findOne({ id: writerId });
    const project = await this.projectRepository.findOne({ id: projectId });
    return await this.taskRepository.save({ project, user, content, limit, taskType, users });
  }

  async update({ taskId, updateUser, content, limit, taskType, userIds }) {
    const task = await this.taskRepository.findOne( { where: {id: taskId}, relations: ['user'] } );
    if (task.user.id !== updateUser) throw new UnauthorizedException('작성자만 수정이 가능합니다.');
    const users = await Promise.all(
      userIds.map(id => {
        return this.userRepository.findOne({ id });
      }),
    );

    const newTask = {
      ...task,
      content,
      limit,
      taskType,
      users,
    };
    return await this.taskRepository.save(newTask);
  }

  async delete({ taskId }) {
    const result = await this.taskRepository.softDelete({ id: taskId }); // 다양한 조건으로 삭제 가능
    return result.affected ? true : false;
  }

  async complete({ taskId }) {
    const task = await this.taskRepository.findOne({ id: taskId });
    const newTask = {
      ...task,
      is_complete: true,
    };
    return await this.taskRepository.save(newTask);
  }

  async notComplete({ taskId }) {
    const task = await this.taskRepository.findOne({ id: taskId });
    const newTask = {
      ...task,
      is_complete: false,
    };
    return await this.taskRepository.save(newTask);
  }

  async progress({ projectId }) {
    const totalTaskCount = await this.taskRepository.count({ project: projectId });
    const completeTaskCount = await this.taskRepository.count({ is_complete: true, project: projectId });
    return Math.floor(completeTaskCount / totalTaskCount);
  }
}
