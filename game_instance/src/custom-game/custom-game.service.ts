import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { GameService } from '@/game/game.service';
import { LobbyState } from './interfaces/lobby-state';
import { Scenario } from '@/game/backend-api.service';
import { ConfigService } from '@/game/config.service';
import { CustomGameConfigService } from './custom-game-config.service';
import { ServerDescription } from './interfaces/server-description';
import { CustomGameParticipantService } from './custom-game-participant.service';

@Injectable()
export class CustomGameService extends GameService implements OnModuleInit {
  @Inject(ConfigService)
  private readonly config: CustomGameConfigService;

  protected readonly participant: CustomGameParticipantService;

  private scenarios: Scenario[];

  private scenario: Scenario;

  onModuleInit() {
    this.backendApi.listAllTitles().then((x) => {
      this.scenarios = x;
      this.scenario = this.scenarios[0];
    });
  }

  get scenarioId(): string {
    return this.scenario.id;
  }

  selectScenario(id: string): boolean {
    const seleted = this.scenarios.find((x) => x.id === id);

    if (seleted) {
      this.scenario = seleted;
    }

    return !!this.scenarios;
  }

  lobby(): LobbyState {
    return {
      ownerId: this.config.ownerId,
      players: [...this.participant.players].map((x) => ({
        id: x.id,
        nickname: x.nickname,
        slot: x.slot,
      })),
      scenarios: this.scenarios,
    };
  }

  serverDescription(): ServerDescription {
    const owner = this.participant.ownerNickname;

    return {
      owner,
      capacity: 10,
      occupancy: this.participant.occupancy,
      started: this.isStarted,
    };
  }
}
