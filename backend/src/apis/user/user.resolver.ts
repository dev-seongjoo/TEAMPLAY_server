import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { BadRequestException, CACHE_MANAGER, Inject, UnauthorizedException, UnprocessableEntityException, UseGuards } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CreateUserInput } from './dto/createUser.Input';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { GqlAuthAccessGuard } from 'src/common/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/common/auth/gql-user.param';
import { UpdateUserOnboardInput } from './dto/updateUser.onboard.input';
import bcrypt from 'bcrypt';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Resolver()
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly elasticsearchService: ElasticsearchService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @UseGuards(GqlAuthAccessGuard)
  @Query(() => User)
  async fetchUser(@CurrentUser() currentUser: ICurrentUser) {
    return await this.userService.findOne({ email: currentUser.email });
  }

  @Query(() => [User])
  async fetchUsers(@Args('page') page: number) {
    return await this.userService.findAll({ page });
  }

  @Mutation(() => String)
  async sendTokenToEmail(@Args('email') email: string) {
    await this.userService.checkUser(email);
    if (this.userService.checkValidationEmail({ email })) {
      const mytoken = this.userService.getToken(6);
      const template = this.userService.getTemplateToken({ mytoken });
      await this.userService.sendEmail({ email, template });
      await this.cacheManager.set(email, mytoken, { ttl: 180000 });
      return `${email}으로 인증번호가 전송되었습니다. ${mytoken}`;
    } else {
      throw new BadRequestException('이메일을 확인해주세요');
    }
  }

  @Mutation(() => Boolean)
  async checkTokenToEmail(@Args('email') email: string, @Args('token') token: string) {
    const mytoken = await this.cacheManager.get(email);
    if (token !== mytoken) throw new BadRequestException('인증번호를 확인해주세요.');

    await this.cacheManager.set(email, true, { ttl: 600000 });
    return true;
  }

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    const checkEmail = await this.cacheManager.get(createUserInput.email);
    if (checkEmail !== true) throw new UnauthorizedException('이메일을 인증해주세요.');
    await this.userService.checkUser(createUserInput.email);

    createUserInput.password = await bcrypt.hash(createUserInput.password, 10);
    await this.cacheManager.set(createUserInput.email, false, { ttl: 0 });
    return await this.userService.create({ createUserInput });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async updateUserByOnboard(
    @CurrentUser() currentUser: ICurrentUser,
    @Args('updateUserOnboardInput') updateUserOnboardInput: UpdateUserOnboardInput,
  ) {
    await this.cacheManager.del(currentUser.email);
    return await this.userService.updateByOnboard({ id: currentUser.id, updateUserOnboardInput });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => User)
  async updateUser(
    @CurrentUser() currentUser: ICurrentUser,
    @Args('name') name: string,
    @Args('password') password: string,
    @Args('changePassword') changePassword: string,
  ) {
    await this.userService.update({ id: currentUser.id, name, password, changePassword });
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => Boolean)
  async deleteUser(@CurrentUser() currentUser: ICurrentUser) {
    return await this.userService.delete({ id: currentUser.id });
  }

  @Mutation(() => Boolean)
  async deleteUserHard(@Args('email') email: string) {
    return await this.userService.deleteHard({ email });
  }
}
