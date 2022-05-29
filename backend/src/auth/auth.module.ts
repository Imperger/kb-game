import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleRecaptchaModule } from '@imperger/google-recaptcha';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailModule } from '../email/email.module';
import { User, UserSchema } from '../common/schemas/user.schema';
import { UserModule } from '../user/user.module';
import { LoginByEmailStrategy, LoginByUsernameStrategy, RegistrationConfirmStrategy } from './strategies';
import { RecaptchaException } from '../common/exceptions/recaptcha-exception';
import Config from '../config';
import { PlayerModule } from 'src/player/player.module';
import { ConfigHelperModule } from 'src/config/config-helper.module';
@Module({
  imports: [
    GoogleRecaptchaModule.forRoot({
      secretKey: Config.reCaptcha.secret,
      exceptionType: RecaptchaException,
      response: req => req.headers.recaptcha,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    EmailModule,
    UserModule,
    PlayerModule,
    ConfigHelperModule
  ],
  providers: [AuthService, LoginByEmailStrategy, LoginByUsernameStrategy, RegistrationConfirmStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
