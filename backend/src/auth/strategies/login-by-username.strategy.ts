import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { LoginByUsernameStrategyName } from '@/auth/constants';

@Injectable()
export class LoginByUsernameStrategy extends PassportStrategy(
  Strategy,
  LoginByUsernameStrategyName
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string) {
    return this.authService.validateByUsername(username, password);
  }
}
