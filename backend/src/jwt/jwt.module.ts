import { Module, Global } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';

import Config from '../config'
import { JwtStrategy } from './jwt.strategy';

@Global()
@Module({
    imports: [
        NestJwtModule.register({
            secret: Config.api.jwtSecret,
            signOptions: { expiresIn: '3m' },
        }),
        UserModule
    ],
    providers: [JwtStrategy],
    exports: [NestJwtModule]
})
export class JwtModule { }
