import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { Type } from './entities/type.entity';
import { TypeService } from './type.service';

@Resolver()
export class TypeResolver {
  constructor(private readonly typeService: TypeService) {}

  @Query(() => [Type])
  async fetchTypes() {
    return await this.typeService.findAll();
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Type)
  async createType(@Args('name') name: string) {
    return await this.typeService.create({ name });
  }
}
