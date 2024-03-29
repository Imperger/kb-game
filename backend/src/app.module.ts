import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

import { AuthModule } from './auth/auth.module';
import Config from './config';
import { ConfigHelperModule } from './config/config-helper.module';
import { GameModule } from './game/game.module';
import { JwtModule } from './jwt/jwt.module';
import { LoggerModule } from './logger/logger.module';
import { MetricsModule } from './metrics/metrics.module';
import { PlayerModule } from './player/player.module';
import { ReplayModule } from './replay/replay.module';
import { ScenarioModule } from './scenario/scenario.module';
import { ScoringModule } from './scoring/scoring.module';
import { SpawnerModule } from './spawner/spawner.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [() => Config]
    }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongo.connectionURI')
      }),
      inject: [ConfigService]
    }),
    PassportModule.register({}),
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: config.get<string>('mail.transport'),
        defaults: {
          from: config.get<string>('mail.from')
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new PugAdapter(),
          options: {
            strict: true
          }
        }
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    UserModule,
    JwtModule,
    SpawnerModule,
    GameModule,
    PlayerModule,
    ConfigHelperModule,
    ScenarioModule,
    LoggerModule,
    ReplayModule,
    ScoringModule,
    MetricsModule
  ]
})
export class AppModule {}
