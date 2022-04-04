import { CACHE_MANAGER, Inject, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/common/auth/gql-user.param';
import { CreateProjectInput } from './dto/createProject.input';
import { Project } from './entities/project.entity';
import { ProjectService } from './project.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Cache } from 'cache-manager';

@Resolver()
export class ProjectResolver {
<<<<<<< HEAD
  constructor(
    private readonly projectService: ProjectService,
    private readonly elasticsearchService: ElasticsearchService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache) {}
    
    @Query(() => [Project])
    async fetchProjects(@Args('page') page: number) {
      return this.projectService.find({ page });
    }
 
    @Query(() => Project)
    async fetchProject(@Args('projectId') projectId: string) {
      return await this.projectService.findOne({ projectId });
    }
    
    @UseGuards(GqlAuthAccessGuard)
    @Mutation(() => Project)
   async createProject(
=======
  constructor(private readonly projectService: ProjectService) {}

  @Query(() => Project)
  async fetchProject(@Args('projectId') projectId: string) {
    return await this.projectService.findOne({ projectId });
  }

  @Query(() => [Project])
  async fetchProjects(@Args('page') page: number) {
    return this.projectService.find({ page });
  }

  @Query(() => Number)
  async fetchProjectCounts() {
    return this.projectService.findCount();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Project])
  async fetchMyProjects(@CurrentUser() currentUser: ICurrentUser) {
    return await this.projectService.findMyProjects({ currentUser });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Project)
  async createProject(
>>>>>>> 4c0cdb0f83c3686a25bd06de2d60caa01a859831
    @CurrentUser() currentUser: ICurrentUser,
    @Args('createProjectInput') createProjectInput: CreateProjectInput,
  ) {
    return await this.projectService.create({ leaderId: currentUser.id, createProjectInput });
  }

  @Query(() => [Project])
  async searchProjects(
    @Args('search') search: string
    ) {
    const list = await this.cacheManager.get(`${search}`);
    if (list) {
      return list;
    }
    else {
      const searchResult = await this.elasticsearchService.search({
        index: 'project',
        from: 0,
        size: 100,
        query: {
          bool: {
            should: [
              {prefix: {name: search}}
            ],
          },
        },
    });
      const searchResultmap = searchResult.hits.hits.map((el:any) => ({
        id:el._source.id,
        name:el._source.name,
      }));
      if(searchResultmap.length === 0){
        throw new UnprocessableEntityException('검색 결과가 존재하지 않습니다.')
      }
      await this.cacheManager.set(`${search}`, searchResultmap, { ttl: 0 });
      return searchResultmap;
    }
  }


  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Project)
  async startProject(
    @CurrentUser() currentUser: ICurrentUser,
    @Args('chatRoomId') chatRoomId: string,
    @Args({ name: 'userIds', type: () => [String] }) userIds: string[],
    @Args('point') point: number,
  ) {
    return await this.projectService.createProjectMember({ chatRoomId, userIds, leaderId: currentUser.id, point });
  }

  @Mutation(() => Boolean)
  async deleteAllProject() {
    return await this.projectService.deleteAll();
  }

  @Mutation(() => Boolean)
  async deleteProject(@Args('projectId') projectId: string) {
    return await this.projectService.delete({ projectId });
  }
}
