import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/common/auth/gql-user.param';
import { Qna, QNA_TYPE_ENUM } from './entities/qna.entity';
import { QnaService } from './qna.service';

@Resolver()
export class QnaResolver {
  constructor(private readonly qnaService: QnaService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Qna])
  async fetchQnas(@Args('projectId') projectId: string) {
    return await this.qnaService.findAll({ projectId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Qna)
  async fetchQna(@Args('qnaId') qnaId: string) {
    return await this.qnaService.findOne({ qnaId });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Qna)
  async createQna(
    @Args('projectId') projectId: string,
    @Args('title') title: string,
    @Args('content') content: string,
    @Args({name:'qnaType', type: () => QNA_TYPE_ENUM }) qnaType:QNA_TYPE_ENUM,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.qnaService.create({ projectId, createUser: currentUser.id, qnaType, title, content });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Qna)
  async updateQna(
    @Args('qnaId') qnaId: string,
    @Args('title') title: string,
    @Args('content') content: string,
    @CurrentUser() currentUser: ICurrentUser,
  ) {
    return await this.qnaService.update({ qnaId, updateUser:currentUser.id, title, content });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteQna(
    @Args('qnaId') qnaId: string,
    @CurrentUser() currentUser: ICurrentUser
    ) {
    return await this.qnaService.delete({ qnaId, deleteUser:currentUser.id });
  }
}
