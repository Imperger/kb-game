import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GameGateway } from './game.gateway';
import { BackendApiService } from './game/backend-api.service';
import { GameService } from './game/game.service';
import { SpawnerGuard } from './guards/spawner/spawner.guard';
import { ShutdownService } from './shutdown.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [
    GameGateway,
    GameService,
    ShutdownService,
    SpawnerGuard,
    BackendApiService,
  ],
})
export class AppModule {}
