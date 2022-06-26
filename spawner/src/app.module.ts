import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { JwtModule } from './jwt/jwt.module';
import { SpawnerModule } from './spawner/spawner.module';

@Module({
  imports: [JwtModule, SpawnerModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
