import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';
import { JwtModule } from './jwt/jwt.module';
import { SpawnerModule } from './spawner/spawner.module';
import { PlayerModule } from './player/player.module';
import { ConfigHelperModule } from './config/config-helper.module';
import Config from './config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [() => Config]
    }),
    MongooseModule.forRoot(Config.mongo.connectionURI),
    PassportModule.register({}),
    AuthModule,
    UserModule,
    EmailModule,
    JwtModule,
    SpawnerModule,
    PlayerModule,
    ConfigHelperModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
