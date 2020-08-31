import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';
import { GetLoginStrategyResult } from './get-login-strategy-result';

@Injectable()
export class LoginByUsernameStrategy extends PassportStrategy(Strategy, 'username') {
    constructor(private authService: AuthService) { super(); }

    async validate(username: string, password: string) {
        const result = await this.authService.validateByUsername(username, password);

        return GetLoginStrategyResult(result);

    }
}