import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { Location } from './entities/location.entity';
import { LocationService } from './location.service';

@Resolver()
export class LocationResolver {
  constructor(private readonly locationService: LocationService) {}

  @Query(() => [Location])
  async fetchLocations() {
    return await this.locationService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Location)
  async createLocation(@Args('name') name: string) {
    return await this.locationService.create({ name });
  }
}
