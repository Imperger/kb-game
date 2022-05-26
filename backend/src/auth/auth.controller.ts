import { Body, Controller, Post, Patch, UseGuards } from '@nestjs/common';
import { Recaptcha } from '@imperger/google-recaptcha';

import { CreateUserDto } from './dto/create-user.dto'
import { AuthService } from './auth.service';
import { LoginByEmailGuard } from './decorators/login-by-email.guard';
import { RegistrationConfirmGuard } from './decorators/registration-confirm.guard';
import { UserId } from './decorators/user-id';
import { StatusCode } from '../common/types/status-code';
import { LoginByUsernameGuard } from './decorators/login-by-username.guard';
import { User } from './decorators/user';
import { User as UserSchema } from '../common/schemas/user.schema'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Recaptcha(0.7)
  @Post('register')
  async register(@Body() user: CreateUserDto) {
    await this.authService.registerUser(user.username, user.email, user.password);

    return { code: StatusCode.Ok };
  }

  @UseGuards(RegistrationConfirmGuard)
  @Patch('registration/confirm')
  async registrationConfirm(@UserId() id: string) {
    await this.authService.confirmRegistration(id);

    return { code: StatusCode.Ok };
  }

  @UseGuards(LoginByEmailGuard)
  @Recaptcha(0.7)
  @Post('login/email')
  async loginEmail(@User() user: UserSchema) {
    return { code: StatusCode.Ok, token: await this.authService.generateAccessToken(user.id) };
  }

  @UseGuards(LoginByUsernameGuard)
  @Recaptcha(0.7)
  @Post('login/username')
  async loginUsername(@User() user: UserSchema) {
    return { code: StatusCode.Ok, token: await this.authService.generateAccessToken(user.id) };
  }
}
