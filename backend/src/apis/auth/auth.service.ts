import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  getAccessToken({ user }) {
    return this.jwtService.sign(
      { email: user.email, sub: user.id },
      { secret: process.env.ACCESS_TOKEN_KEY, expiresIn: '1h' },
    );
  }

  setRefreshToken({ user, res }) {
    const refreshToken = this.jwtService.sign(
      { email: user.email, sub: user.id },
      { secret: process.env.REFRESH_TOKEN_KEY, expiresIn: '2w' },
    );
    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; path=/; domain=.ljh305.shop; SameSite=None; Secure; httpOnly;`,
    );
  }

  async snsLogin(req, res) {
    let user = await this.userService.findOne({ email: req.user.email });

    if (!user) {
      await this.cacheManager.set(req.user.email, false, { ttl: 0 });
      const createUserInput = req.user;
      user = await this.userService.create({ createUserInput });
    }

    this.setRefreshToken({ user, res });

    const isOnboarding = await this.cacheManager.get(user.email);
    isOnboarding === false
      ? res.redirect('http://localhost:3000/onboarding')
      : res.redirect('http://localhost:3000/main');
  }
}
