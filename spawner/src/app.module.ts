import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpawnerService } from './spawner/spawner.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, SpawnerService],
})
export class AppModule {}
