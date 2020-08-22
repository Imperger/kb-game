import { Body, Controller, Post } from '@nestjs/common';
import { Recaptcha } from '@imperger/google-recaptcha';

import { CreateUserDto } from './dto/create-user.dto'

@Controller('auth')
export class AuthController {
    @Recaptcha(0.7)
    @Post('register')
    register(@Body() newUser: CreateUserDto): string {
        return newUser.username;
    }
}
