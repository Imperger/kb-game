import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { GameService } from '@/game/game.service';
import { CustomGameController } from './custom-game.controller';
import { CustomGameService } from './custom-game.service';
import { EventEmitterService } from '@/game/event-emitter.service';
import { ParticipantService } from '@/game/participant.service';
import { BackendApiService } from '@/game/backend-api.service';
import { ShutdownService } from '@/shutdown.service';
import { WsServerRefService } from '@/game/ws-server-ref.service';
import { ConfigService } from '@/game/config.service';
import { CustomGameConfigService } from './custom-game-config.service';
import { CustomGameGateway } from './custom-game.gateway';
import { CustomGameParticipantService } from './custom-game-participant.service';
import { CustomGameShutdownService } from './custom-game-shutdown.service';

@Module({
  imports: [HttpModule],
  controllers: [CustomGameController],
  providers: [
    {
      provide: GameService,
      useClass: CustomGameService,
    },
    {
      provide: ConfigService,
      useClass: CustomGameConfigService,
    },
    {
      provide: ParticipantService,
      useClass: CustomGameParticipantService,
    },
    {
      provide: ShutdownService,
      useClass: CustomGameShutdownService,
    },
    CustomGameGateway,
    EventEmitterService,
    BackendApiService,
    WsServerRefService,
  ],
})
export class CustomGameModule {}
