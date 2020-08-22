import { BadRequestException, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleRecaptchaModule } from '@imperger/google-recaptcha';
import Config from '../config';
@Module({
  imports: [
    GoogleRecaptchaModule.forRoot({
      secretKey: Config.reCaptcha.secret,
      response: req => req.headers.recaptcha,
      onError: () => {
        throw new BadRequestException('Invalid recaptcha.')
      }
    })
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule { }
