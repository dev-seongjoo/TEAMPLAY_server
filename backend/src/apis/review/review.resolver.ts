import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/common/auth/gql-user.param';
import { Review } from './entities/review.entity';
import { ReviewService } from './review.service';

@Resolver()
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => [Review])
  async fetchReviews(@Args('projectId') projectId: string) {
    return await this.reviewService.findAll({projectId});
  }

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => Review)
  async fetchReview(@Args('reviewId') reviewId: string) {
    return await this.reviewService.findOne({reviewId});
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Review)
  async createReview(
    @Args('projectId') projectId: string,
    @Args('title') title: string,
    @Args('content') content: string,
    @CurrentUser() currentUser: ICurrentUser,
  ){
    return await this.reviewService.create({projectId, createUser:currentUser.id, title, content})
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Review)
  async updateReview(
    @Args('reviewId') reviewId: string,
    @Args('title') title: string,
    @Args('content') content: string,
    @CurrentUser() currentUser: ICurrentUser,
  ){
    return await this.reviewService.update({reviewId, updateUser:currentUser.id, title, content})
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteReview(
    @Args('reviewId') reviewId: string,
    @CurrentUser() currentUser: ICurrentUser
    ) {
    return await this.reviewService.delete({ reviewId, deleteUser:currentUser.id });
  }
}