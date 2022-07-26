import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { UserConfirmationToken } from '@/auth/interfaces/user-confirmation-token';
import { RegistrationConfirmStrategyName } from '@/auth/constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RegistrationConfirmStrategy extends PassportStrategy(
  Strategy,
  RegistrationConfirmStrategyName
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('code'),
      secretOrKey: config.get<string>('auth.registrationConfirmJwtSecret')
    });
  }

  async validate(payload: UserConfirmationToken) {
    return payload;
  }
}
