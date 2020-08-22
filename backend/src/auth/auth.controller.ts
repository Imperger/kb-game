import { Body, Controller, Post } from '@nestjs/common';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { CreateUserDto } from './dto/create-user.dto'

@Controller('auth')
export class AuthController {
    @Recaptcha()
    @Post('register')
    register(@Body() newUser: CreateUserDto): string {
        return newUser.username;
    }
}
