import { Body, Controller, Post, Patch, UseGuards, UseFilters } from '@nestjs/common';
import { Recaptcha } from '@imperger/google-recaptcha';

import { CreateUserDto } from './dto/create-user.dto'
import { AuthService } from './auth.service';
import { UserCredentialsDto } from './dto/user-credentials.dto';
import { LoginByEmailGuard } from './decorators/login-by-email.guard';
import { RegistrationConfirmGuard } from './decorators/registration-confirm.guard';
import { UserId } from '../user/decorators/user-id';
import { StatusCode } from '../common/types/status-code';
import { RegisterExceptionFilter } from './filters/register-exception.filter';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @UseFilters(RegisterExceptionFilter)
    @Recaptcha(0.7)
    @Post('register')
    async register(@Body() user: CreateUserDto) {
        console.log(user);
        await this.authService.registerUser(user.username, user.email, user.password);

        return { code: StatusCode.Ok };
    }

    @UseGuards(RegistrationConfirmGuard)
    @Patch('registration/confirm')
    async registrationConfirm(@UserId() id: string) {
        console.log(id);
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
