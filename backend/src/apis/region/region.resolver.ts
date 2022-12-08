import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { Region } from './entities/region.entity';
import { RegionService } from './region.service';

@Resolver()
export class RegionResolver {
  constructor(private readonly regionService: RegionService) {}

  @Query(() => [Region])
  async fetchRegions() {
    return await this.regionService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Region)
  async createRegion(@Args('name') name: string) {
    return await this.regionService.create({ name });
  }
}
