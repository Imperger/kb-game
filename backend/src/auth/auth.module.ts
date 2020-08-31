import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleRecaptchaModule } from '@imperger/google-recaptcha';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailModule } from '../email/email.module';
import { User, UserSchema } from '../common/schemas/user.schema';
import { UserModule } from '../user/user.module';
import { LoginByEmailStrategy, LoginByUsernameStrategy, RegistrationConfirmStrategy } from './strategies';
import { CaptchaException } from '../common/exceptions/captcha-exception';
import Config from '../config';
@Module({
  imports: [
    GoogleRecaptchaModule.forRoot({
      secretKey: Config.reCaptcha.secret,
      exceptionType: CaptchaException,
      response: req => req.headers.recaptcha,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EmailModule,
    UserModule
  ],
  providers: [AuthService, LoginByEmailStrategy, LoginByUsernameStrategy, RegistrationConfirmStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
