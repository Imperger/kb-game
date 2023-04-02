import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

import { JwtStrategy } from './jwt.strategy';

import { UserModule } from '@/user/user.module';

@Global()
@Module({
  imports: [
    NestJwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('api.jwtSecret'),
        signOptions: { expiresIn: '30m' }
      }),
      inject: [ConfigService]
    }),
    UserModule
  ],
  providers: [JwtStrategy],
  exports: [NestJwtModule]
})
export class JwtModule {}
