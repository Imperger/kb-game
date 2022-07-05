import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';

import { JwtModule } from './jwt/jwt.module';
import { SpawnerModule } from './spawner/spawner.module';
import Config from './config';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    ignoreEnvFile: true,
    load: [() => Config]
  }),
    JwtModule,
    SpawnerModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }
