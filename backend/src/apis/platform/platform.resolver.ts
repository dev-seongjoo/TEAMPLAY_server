import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { Platform } from './entities/platform.entity';
import { PlatformService } from './platform.service';

@Resolver()
export class PlatformResolver {
  constructor(private readonly platformService: PlatformService) {}

  @Query(() => [Platform])
  async fetchPlatforms() {
    return await this.platformService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Platform)
  async createPlatform(@Args('name') name: string) {
    return await this.platformService.create({ name });
  }
}
