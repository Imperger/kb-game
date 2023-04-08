import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { GameService } from '@/game/game.service';
import { LobbyState } from './interfaces/lobby-state';
import { ConfigService } from '@/game/config.service';
import { QuickGameConfigService } from './quick-game-config.service';
import { ServerDescription } from './interfaces/server-description';
import { Scenario } from '@/game/backend-api.service';

@Injectable()
export class QuickGameService extends GameService implements OnModuleInit {
  private _scenario: Scenario | null = null;

  async onModuleInit() {
    const id = this.config.scenarioId;

    try {
      this._scenario = {
        id,
        ...(await this.backendApi.fetchScenarioContent(id)),
      };
    } catch (e) {
      // Failed to fetch scenario
    }

    return 0;
  }

  @Inject(ConfigService)
  private readonly config: QuickGameConfigService;

  get scenario(): Scenario {
    return this._scenario;
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
