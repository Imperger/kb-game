import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import Config from '../config';
import { AuthToken } from './interfaces/auth-token';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: Config.api.jwtSecret,
    });
  }

  async validate(token: AuthToken) {
    const user =  await this.userService.findById(token.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (token.iat * 1000 < user.secret.updatedAt.getTime()) {
      throw new UnauthorizedException();
    }

    return user;
  }
}