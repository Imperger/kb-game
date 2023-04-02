import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GoogleRecaptchaModule } from '@nestlab/google-recaptcha';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  LoginByEmailStrategy,
  LoginByUsernameStrategy,
  RegistrationConfirmStrategy
} from './strategies';

import { ConfigHelperModule } from '@/config/config-helper.module';
import { MetricsModule } from '@/metrics/metrics.module';
import { PlayerModule } from '@/player/player.module';
import { User, UserSchema } from '@/user/schemas/user.schema';
import { UserModule } from '@/user/user.module';

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
    UserModule,
    PlayerModule,
    ConfigHelperModule,
    MetricsModule
  ],
  providers: [
    AuthService,
    LoginByEmailStrategy,
    LoginByUsernameStrategy,
    RegistrationConfirmStrategy
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
