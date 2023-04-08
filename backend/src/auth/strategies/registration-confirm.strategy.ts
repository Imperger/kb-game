import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { RegistrationConfirmStrategyName } from '@/auth/constants';
import { UserConfirmationToken } from '@/auth/interfaces/user-confirmation-token';

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
