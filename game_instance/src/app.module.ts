import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { GameGateway } from './game.gateway';
import { BackendApiService } from './game/backend-api.service';
import { EventEmitterService } from './game/event-emitter.service';
import { GameService } from './game/game.service';
import { ParticipantService } from './game/participant.service';
import { WsServerRefService } from './game/ws-server-ref.service';
import { SpawnerGuard } from './guards/spawner.guard';
import { ShutdownService } from './shutdown.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [
    WsServerRefService,
    EventEmitterService,
    GameGateway,
    ParticipantService,
    GameService,
    ShutdownService,
    SpawnerGuard,
    BackendApiService,
  ],
})
export class AppModule {}
