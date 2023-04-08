import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthToken } from './interfaces/auth-token';

import { UserService } from '@/user/user.service';

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

    // The user may not have a secret if registration occurs through an external service
    if (user.secret && token.iat * 1000 < user.secret.updatedAt.getTime()) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
