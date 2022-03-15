import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { AuthService } from '../auth.service';

@Injectable()
export class LoginByEmailStrategy extends PassportStrategy(Strategy, 'email') {
    constructor(private authService: AuthService) { super({ usernameField: 'email' }); }

    async validate(email: string, password: string) {
        return this.authService.validateByEmail(email, password);
    }
}