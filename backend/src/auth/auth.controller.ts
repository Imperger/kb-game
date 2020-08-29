import { Body, Controller, Post, Patch, UseGuards } from '@nestjs/common';
import { Recaptcha } from '@imperger/google-recaptcha';

import { CreateUserDto } from './dto/create-user.dto'
import { AuthService } from './auth.service';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { RegistrationConfirm } from './dto/registration-confirm.dto';
import { LoginByEmailGuard } from './decorators/login-by-email.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Recaptcha(0.7)
    @Post('register')
    async register(@Body() user: CreateUserDto) {
        console.log(user);
        await this.authService.registerUser(user.username, user.email, user.password);

        return { registered: true };
    }

    @Patch('registration/confirm')
    async registrationConfirm(@Body() confirm: RegistrationConfirm) {
        console.log(confirm);
    }

    @UseGuards(LoginByEmailGuard)
    @Recaptcha(0.7)
    @Post('login/email')
    async loginEmail(@Body() credentials: UserCredentialsDto) {
        console.log(credentials);
    }

    @Recaptcha(0.7)
    @Post('login/username')
    async loginUsername(@Body() credentials: UserCredentialsDto) {
        console.log(credentials);
    }
}
