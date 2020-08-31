import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import Config from '../../config';
import { UserConfirmationToken } from '../interfaces/user-confirmation-token';

@Injectable()
export class RegistrationConfirmStrategy extends PassportStrategy(Strategy, 'registration_confirm') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('code'),
      secretOrKey: Config.auth.jwtSecret,
    });
  }

  async validate(payload: UserConfirmationToken) {
    return payload;
  }
}