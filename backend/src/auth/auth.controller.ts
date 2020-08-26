import { Body, Controller, Post } from '@nestjs/common';
import { Recaptcha } from '@imperger/google-recaptcha';

import { CreateUserDto } from './dto/create-user.dto'
import { AuthService } from './auth.service';

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
}
