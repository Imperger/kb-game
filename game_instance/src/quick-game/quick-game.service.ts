import { Inject, Injectable } from '@nestjs/common';

import { GameService } from '@/game/game.service';
import { LobbyState } from './interfaces/lobby-state';
import { ConfigService } from '@/game/config.service';
import { QuickGameConfigService } from './quick-game-config.service';
import { ServerDescription } from './interfaces/server-description';

@Injectable()
export class QuickGameService extends GameService {
  @Inject(ConfigService)
  private readonly config: QuickGameConfigService;

  get scenarioId(): string {
    return this.config.scenarioId;
  }

  lobby(): LobbyState {
    return {
      players: [...this.participant.players].map((x) => ({
        id: x.id,
        nickname: x.nickname,
        slot: x.slot,
      })),
    };
  }

  serverDescription(): ServerDescription {
    return {
      capacity: 10,
      occupancy: this.participant.occupancy,
      started: this.isStarted,
    };
  }
}
