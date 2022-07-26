import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service';
import { LoginByEmailStrategyName } from '@/auth/constants';

@Injectable()
export class LoginByEmailStrategy extends PassportStrategy(
  Strategy,
  LoginByEmailStrategyName
) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    return this.authService.validateByEmail(email, password);
  }
}
