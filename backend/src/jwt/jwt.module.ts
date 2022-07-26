import { Module, Global } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

import { UserModule } from '@/user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

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
