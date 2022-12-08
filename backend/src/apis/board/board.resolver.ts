import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BoardService } from './board.service';
import { Board } from './entities/board.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/common/auth/gql-user.param';

@Resolver()
export class BoardResolver {
  constructor(private readonly boardService: BoardService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Board])
  async fetchBoards(@Args('projectId') projectId: string) {
    return await this.boardService.findAll({ projectId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Board)
  async fetchBoard(@Args('boardId') boardId: string) {
    return await this.boardService.findOne({ boardId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  async createBoard(
    @Args('projectId') projectId: string,
    @Args('title') title: string,
    @Args('content') content: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.boardService.create({ projectId, createUser: currentUser.id, title, content });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Board)
  async updateBoard(
    @Args('boardId') boardId: string,
    @Args('title') title: string,
    @Args('content') content: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.boardService.update({ boardId, updateUser:currentUser.id, title, content });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteBoard(
    @Args('boardId') boardId: string,
    @CurrentUser() currentUser: ICurrentUser
    ) {
    return await this.boardService.delete({ boardId, deleteUser:currentUser.id });
  }
}
