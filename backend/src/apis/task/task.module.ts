import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskResolver } from './task.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Project } from '../project/entities/project.entity';
import { User } from '../user/entities/user.entity';
import { ProjectMember } from '../project/entities/projectMember.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User, Project, ProjectMember])],
  providers: [TaskResolver, TaskService]
})
export class TaskModule {}
