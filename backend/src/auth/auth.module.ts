import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';
import { ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailModule } from '@/email/email.module';
import { User, UserSchema } from '@/user/schemas/user.schema';
import { UserModule } from '@/user/user.module';
import { LoginByEmailStrategy, LoginByUsernameStrategy, RegistrationConfirmStrategy } from './strategies';
import { PlayerModule } from '@/player/player.module';
import { ConfigHelperModule } from '@/config/config-helper.module';
@Module({
  imports: [
    GoogleRecaptchaModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        secretKey: config.get<string>('reCaptcha.secret'),
        response: req => req.headers.recaptcha,
        skipIf: () => process.env.NODE_ENV === 'test',
        score: 0.7
      }),
      inject: [ConfigService]
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
