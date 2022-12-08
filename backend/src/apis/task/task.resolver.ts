import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TaskService } from './task.service';
import { Task, TASK_TYPE_ENUM } from './entities/task.entity';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, ICurrentUser } from 'src/common/auth/gql-user.param';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';


@Resolver()
export class TaskResolver {
  constructor(
    private readonly taskService: TaskService,
    ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Task])
  async fetchTasks(@Args('projectId') projectId: string) {
    return await this.taskService.findAll({projectId});
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Task)
  async fetchTask(@Args('taskId') taskId: string) {
    return await this.taskService.findOne({taskId});
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Task)
  async createTask(
    @Args('projectId') projectId: string,
    @Args('content') content: string,
    @Args('limit') limit: Date,
    @Args({name:'taskType', type: () => TASK_TYPE_ENUM }) taskType: TASK_TYPE_ENUM,
    @Args({name: 'userIds', type: () => [String]}) userIds: string[],
    @CurrentUser() currentUser: ICurrentUser
    ) {
    return await this.taskService.create({projectId, writerId: currentUser.id, content, limit, taskType, userIds});
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Task)
  async updateTask(
    @Args('taskId') taskId: string,
    @Args('content') content: string,
    @Args('limit') limit: Date,
    @Args({name:'taskType', type: () => TASK_TYPE_ENUM }) taskType: TASK_TYPE_ENUM,
    @Args({ name: 'userIds', type: () => [String]}) userIds: string[],
    @CurrentUser() currentUser: ICurrentUser
  ) {
    return await this.taskService.update({taskId, updateUser:currentUser.id, content, limit, taskType, userIds});
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteTask(
    @Args('taskId') taskId: string) {
    return await this.taskService.delete({taskId})};
  
  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Task)
  async completeTask(
    @Args('taskId') taskId: string
  ) {
    console.log(taskId)
    return await this.taskService.complete({taskId})
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Task)
  async notCompleteTask(
    @Args('taskId') taskId: string
  ) {
    return await this.taskService.notComplete({taskId})
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Int)
  async progressRatio(
    @Args('projectId') projectId: string
  ) {
    return await this.taskService.progress({projectId})
  }
}
