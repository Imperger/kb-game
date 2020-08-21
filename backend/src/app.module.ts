import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

import ConfigLoader from './config/config-loader';
import LaunchParams from './launch-params';

@Module({
  imports: [AuthModule,
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [() => ConfigLoader(LaunchParams.config)]
    })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
