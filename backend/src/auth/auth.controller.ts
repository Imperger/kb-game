import { Body, Controller, Post, Patch, UseGuards, HttpCode } from '@nestjs/common';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { CreateUserDto } from './dto/create-user.dto'
import { AuthService } from './auth.service';
import { LoginByEmailGuard } from './decorators/login-by-email.guard';
import { RegistrationConfirmGuard } from './decorators/registration-confirm.guard';
import { UserId } from './decorators/user-id';
import { StatusCode } from '@/common/types/status-code';
import { LoginByUsernameGuard } from './decorators/login-by-username.guard';
import { User } from './decorators/user';
import { User as UserSchema } from '@/user/schemas/user.schema'
import { LoggerService } from '@/logger/logger.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService) { }

  @Recaptcha()
  @Post('register')
  async register(@Body() user: CreateUserDto) {
    const userId = await this.authService.registerUser(user.username, user.email, user.password);

    this.logger.log(`User data '${userId}:${user.username}:${user.email}'`, 'AuthController::SignUp');

    return { code: StatusCode.Ok };
  }

  @UseGuards(RegistrationConfirmGuard)
  @Patch('registration/confirm')
  async registrationConfirm(@UserId() id: string) {
    await this.authService.confirmRegistration(id);

    this.logger.log(`Confirmed by user '${id}'`, 'AuthController::SignUp');

    return { code: StatusCode.Ok };
  }

  @UseGuards(LoginByEmailGuard)
  @Recaptcha()
  @HttpCode(200)
  @Post('login/email')
  async loginEmail(@User() user: UserSchema) {

    this.logger.log(`By email '${user.id}':${user.username}`, 'AuthController::SignIn');

    return { code: StatusCode.Ok, token: await this.authService.generateAccessToken(user.id) };
  }

  @UseGuards(LoginByUsernameGuard)
  @Recaptcha()
  @HttpCode(200)
  @Post('login/username')
  async loginUsername(@User() user: UserSchema) {

    this.logger.log(`By username '${user.id}':${user.username}`, 'AuthController::SignIn');

    return { code: StatusCode.Ok, token: await this.authService.generateAccessToken(user.id) };
  }
}
