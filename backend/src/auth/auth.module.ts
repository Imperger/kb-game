import { BadRequestException, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleRecaptchaModule } from '@imperger/google-recaptcha';
import Config from '../config';
import { EmailModule } from '../email/email.module';
import { User, UserSchema } from '../schemas/user.schema';
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
    EmailModule
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
