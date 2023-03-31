import {
  Body,
  Controller,
  Post,
  Patch,
  UseGuards,
  HttpCode
} from '@nestjs/common';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginByEmailGuard } from './decorators/login-by-email.guard';
import { RegistrationConfirmGuard } from './decorators/registration-confirm.guard';
import { UserId } from './decorators/user-id';
import { LoginByUsernameGuard } from './decorators/login-by-username.guard';
import { User } from './decorators/user';
import { User as UserSchema } from '@/user/schemas/user.schema';
import { LoggerService } from '@/logger/logger.service';
import { AuthGoogleGuard } from './decorators/auth-google.guard';
import { GoogleIdToken, GoogleIdTokenDecoded } from './decorators/google-id-token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: LoggerService
  ) {}

  @Recaptcha()
  @Post('register')
  async register(@Body() user: CreateUserDto) {
    const userId = await this.authService.registerUser(
      user.username,
      user.email,
      user.password
    );

    this.logger.log(
      `New user with form '${userId}:${user.username}:${user.email}'`,
      'AuthController::SignUp'
    );
  }

  @UseGuards(AuthGoogleGuard(false))
  @Recaptcha()
  @Post('register/google')
  async registerGoogle(@GoogleIdToken() idToken: GoogleIdTokenDecoded) {
    const username = idToken.payload.name.replace(/\s/g, '');
    const userId = await this.authService.registerUserByGoogle(username, 
      idToken.payload.email, 
      idToken.payload.sub);

    this.logger.log(
      `New user with google '${userId}:${idToken.payload.sub}:${username}:${idToken.payload.email}'`,
      'AuthController::SignUp'
    );
  }

  @UseGuards(RegistrationConfirmGuard)
  @Patch('registration/confirm')
  async registrationConfirm(@UserId() id: string) {
    await this.authService.confirmRegistration(id);

    this.logger.log(`Confirmed by user '${id}'`, 'AuthController::SignUp');
  }

  @UseGuards(LoginByEmailGuard)
  @Recaptcha()
  @HttpCode(200)
  @Post('login/email')
  async loginEmail(@User() user: UserSchema) {
    this.logger.log(
      `With email '${user.id}':${user.username}`,
      'AuthController::SignIn'
    );

    return { token: await this.authService.generateAccessToken(user.id) };
  }

  @UseGuards(LoginByUsernameGuard)
  @Recaptcha()
  @HttpCode(200)
  @Post('login/username')
  async loginUsername(@User() user: UserSchema) {
    this.logger.log(
      `With username '${user.id}':${user.username}`,
      'AuthController::SignIn'
    );

    return { token: await this.authService.generateAccessToken(user.id) };
  }

  @UseGuards(AuthGoogleGuard(true))
  @Recaptcha()
  @HttpCode(200)
  @Post('login/google')
  async loginGoogle(@User() user: UserSchema) {
    this.logger.log(
      `With google '${user.id}':${user.username}`,
      'AuthController::SignIn'
    );

    return { token: await this.authService.generateAccessToken(user.id) };
  }
}
