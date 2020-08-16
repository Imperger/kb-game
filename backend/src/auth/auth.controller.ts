import { Body, Controller, Post } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto'

@Controller('auth')
export class AuthController {
    @Post('register_email')
    register_email(@Body() newUser: CreateUserDto): string {
        return newUser.username;
    }
}
