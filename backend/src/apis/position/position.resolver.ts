import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { Position } from './entities/position.entity';
import { PositionService } from './position.service';

@Resolver()
export class PositionResolver {
  constructor(private readonly positionService: PositionService) {}

  @Query(() => [Position])
  async fetchPositions() {
    return await this.positionService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Position)
  async createPosition(@Args('name') name: string) {
    return await this.positionService.create({ name });
  }
}
