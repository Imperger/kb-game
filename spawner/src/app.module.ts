import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpawnerService } from './spawner/spawner.service';

import { JwtModule } from './jwt/jwt.module';

@Module({
  imports: [JwtModule],
  controllers: [AppController],
  providers: [AppService, SpawnerService],
})
export class AppModule {}
