import { BadRequestException, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleRecaptchaModule } from '@imperger/google-recaptcha';
import Config from '../config';
import { EmailModule } from '../email/email.module';
import { User, UserSchema } from '../schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { LoginByEmailStrategy } from './login-by-email.strategy';
@Module({
  imports: [
    GoogleRecaptchaModule.forRoot({
      secretKey: Config.reCaptcha.secret,
      response: req => req.headers.recaptcha,
      onError: () => {
        throw new BadRequestException('Invalid recaptcha.')
      }
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: Config.api.jwtSecret,
      signOptions: { expiresIn: '3m' },
    }),
    EmailModule,
    UserModule
  ],
  providers: [AuthService, LoginByEmailStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
