import {
  Body,
  Controller,
  Post,
  Patch,
  UseGuards,
  HttpCode,
  Put,
  BadRequestException
} from '@nestjs/common';
import { Recaptcha } from '@nestlab/google-recaptcha';

import { AuthService } from './auth.service';
import {
  GoogleIdToken,
  GoogleIdTokenDecoded
} from './decorators/google-id-token';
import { User } from './decorators/user';
import { UserId } from './decorators/user-id';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password-dto';
import { ValidatePasswordDto } from './dto/validate-password-dto';
import { AuthGoogleGuard } from './guards/auth-google.guard';
import { LoginByEmailGuard } from './guards/login-by-email.guard';
import { LoginByUsernameGuard } from './guards/login-by-username.guard';
import { RegistrationConfirmGuard } from './guards/registration-confirm.guard';

import { JwtGuard } from '@/jwt/decorators/jwt.guard';
import { LoggerService } from '@/logger/logger.service';
import { User as UserSchema } from '@/user/schemas/user.schema';

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
    const userId = await this.authService.registerUserByGoogle(
      username,
      idToken.payload.email,
      idToken.payload.sub
    );

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

  @UseGuards(JwtGuard)
  @Recaptcha()
  @HttpCode(200)
  @Post('password/validate')
  async validatePassword(
    @User() user: UserSchema,
    @Body() payload: ValidatePasswordDto
  ) {
    let valid = true;

    try {
      await this.authService.validateUser(user, payload.password);
    } catch (e) {
      valid = false;
    }

    return { valid };
  }

  @UseGuards(JwtGuard)
  @Recaptcha()
  @Put('password')
  async updatePassword(
    @User() user: UserSchema,
    @Body() update: UpdatePasswordDto
  ) {
    if (update.password === update.updatedPassword) {
      return;
    }

    try {
      if (user.secret) {
        await this.authService.validateUser(user, update.password);
      }

      await this.authService.updatePassword(user._id, update.updatedPassword);

      this.logger.log(
        `Updated password for '${user.id}':${user.username}`,
        'AuthController::Password'
      );
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
