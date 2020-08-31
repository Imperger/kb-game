import { Module, Global } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';

import Config from '../config'
import { JwtStrategy } from './jwt.strategy';

@Global()
@Module({
    imports: [
        NestJwtModule.register({
            secret: Config.api.jwtSecret,
            signOptions: { expiresIn: '3m' },
        })
    ],
    providers: [JwtStrategy],
    exports: [NestJwtModule]
})
export class JwtModule { }
