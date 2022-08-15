import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { GameService } from '@/game/game.service';
import { QuickGameService } from './quick-game.service';
import { ConfigService } from '@/game/config.service';
import { QuickGameConfigService } from './quick-game-config.service';
import { QuickGameGateway } from './quick-game.gateway';
import { EventEmitterService } from '@/game/event-emitter.service';
import { ParticipantService } from '@/game/participant.service';
import { BackendApiService } from '@/game/backend-api.service';
import { ShutdownService } from '@/shutdown.service';
import { WsServerRefService } from '@/game/ws-server-ref.service';
import { QuickGameparticiantService } from './quick-game-participant.service';
import { QuickGameController } from './quick-game.controller';

@Module({
  imports: [HttpModule],
  controllers: [QuickGameController],
  providers: [
    {
      provide: GameService,
      useClass: QuickGameService,
    },
    {
      provide: ConfigService,
      useClass: QuickGameConfigService,
    },
    {
      provide: ParticipantService,
      useClass: QuickGameparticiantService,
    },
    QuickGameGateway,
    EventEmitterService,
    BackendApiService,
    ShutdownService,
    WsServerRefService,
  ],
})
export class QuickGameModule {}
