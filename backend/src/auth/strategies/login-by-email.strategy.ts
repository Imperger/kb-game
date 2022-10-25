import { Counter } from 'prom-client';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

import { AuthService } from '@/auth/auth.service';
import { LoginByEmailStrategyName } from '@/auth/constants';
import { loginSuccessCountTotalToken, loginUnsuccessCountTotalToken } from '@/metrics/inject-tokens';

@Injectable()
export class LoginByEmailStrategy extends PassportStrategy(
  Strategy,
  LoginByEmailStrategyName
) {
  constructor(
    private authService: AuthService,
    @InjectMetric(loginSuccessCountTotalToken) private loginSuccessCounter: Counter<string>,
    @InjectMetric(loginUnsuccessCountTotalToken) private loginUnsuccessCounter: Counter<string>) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    try {
      const user = await this.authService.validateByEmail(email, password);

      this.loginSuccessCounter.inc(1);

      return user;
    } catch (e) {
      this.loginUnsuccessCounter.inc(1);

      throw e;
    }
  }
}
