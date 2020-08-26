import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';

import Config from './config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [() => Config]
    }),
    MongooseModule.forRoot(Config.mongo.connectionURI),
    AuthModule,
    UserModule,
    EmailModule,],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
