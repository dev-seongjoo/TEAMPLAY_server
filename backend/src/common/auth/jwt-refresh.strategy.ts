import { CACHE_MANAGER, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: req => {
        const cookie = req.headers.cookie;
        return cookie.replace('refreshToken=', '');
      },
      secretOrKey: process.env.REFRESH_TOKEN_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const refreshToken = req.headers.cookie.replace('refreshToken=', '');
    const tokenCache = await this.cacheManager.get(`refreshToken:${refreshToken}`);
    if (tokenCache) throw new UnauthorizedException('로그아웃된 토큰');

    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
