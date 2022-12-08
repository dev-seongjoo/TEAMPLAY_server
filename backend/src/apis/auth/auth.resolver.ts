import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { CACHE_MANAGER, Inject, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { GqlAuthAccessGuard, GqlAuthRefeshGuard } from 'src/common/auth/gql-auth.guard';
import { CurrentUser, ICurrentUser } from 'src/common/auth/gql-user.param';
import { IContext } from 'src/common/types/context';
import { getToday } from 'src/common/libraries/utils';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Token } from './dto/token';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Mutation(() => Token)
  async login(
    @Args('email') email: string, //
    @Args('password') password: string,
    @Context() context: IContext,
  ) {
    const user = await this.userService.findOne({ email });
    if (!user) throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.');
    const isAuthenticated = await bcrypt.compare(password, user.password);
    if (!isAuthenticated) throw new UnauthorizedException('이메일 또는 비밀번호가 틀렸습니다.');

    this.authService.setRefreshToken({ user, res: context.res });
    const accessToken = this.authService.getAccessToken({ user });

    const isOnboarding = await this.cacheManager.get(email);
    return isOnboarding === false
      ? {
          accessToken,
          onboarding: false,
        }
      : {
          accessToken,
          onboarding: true,
        };
  }

  @UseGuards(GqlAuthRefeshGuard)
  @Mutation(() => Token)
  restoreAccessToken(@CurrentUser() currentUser: ICurrentUser) {
    return { accessToken: this.authService.getAccessToken({ user: currentUser }) };
  }

  @UseGuards(GqlAuthAccessGuard)
  @Mutation(() => String)
  async logout(@Context() context: IContext) {
    const accessToken = context.req.headers.authorization.split(' ')[1];
    const refreshToken = context.req.headers.cookie.replace('refreshToken=', '');

    try {
      const accessPayload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);
      const refreshPayload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);

      const now = Date.parse(getToday()) / 1000;
      await this.cacheManager.set(`accessToken:${accessToken}`, 'accessToken', {
        ttl: typeof accessPayload === 'object' ? accessPayload.exp - now : -1,
      });
      await this.cacheManager.set(`refreshToken:${refreshToken}`, 'refreshToken', {
        ttl: typeof refreshPayload === 'object' ? refreshPayload.exp - now : -1,
      });
    } catch (error) {
      if (error?.response?.data?.message) {
        throw new UnauthorizedException(error.response.data.message, error.response.status);
      } else {
        throw error;
      }
    }

    return '로그아웃에 성공했습니다';
  }
}
