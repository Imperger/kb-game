import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthToken } from './interfaces/auth-token';
import { UserService } from '@/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    readonly config: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('api.jwtSecret')
    });
  }

  async validate(token: AuthToken) {
    const user = await this.userService.findById(token.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (token.iat * 1000 < user.secret.updatedAt.getTime()) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
