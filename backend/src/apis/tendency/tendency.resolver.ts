import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { Tendency } from './entities/tendency.entity';
import { TendencyService } from './tendency.service';

@Resolver()
export class TendencyResolver {
  constructor(private readonly tendecyService: TendencyService) {}

  @Query(() => [Tendency])
  async fetchTendencys() {
    return await this.tendecyService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Tendency)
  async createTendency(@Args('name') name: string) {
    return await this.tendecyService.create({ name });
  }
}
