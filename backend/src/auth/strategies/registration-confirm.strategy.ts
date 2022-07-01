import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import Config from '@/config';
import { UserConfirmationToken } from '@/auth/interfaces/user-confirmation-token';
import { RegistrationConfirmStrategyName } from '@/auth/constants';

@Injectable()
export class RegistrationConfirmStrategy extends PassportStrategy(Strategy, RegistrationConfirmStrategyName) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('code'),
      secretOrKey: Config.auth.registrationConfirmJwtSecret,
    });
  }

  async validate(payload: UserConfirmationToken) {
    return payload;
  }
}