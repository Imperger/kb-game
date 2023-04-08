import { Inject, Injectable } from '@nestjs/common';

import { GameService } from '@/game/game.service';
import { LobbyState } from './interfaces/lobby-state';
import { Scenario } from '@/game/backend-api.service';
import { ConfigService } from '@/game/config.service';
import { CustomGameConfigService } from './custom-game-config.service';
import { ServerDescription } from './interfaces/server-description';
import { CustomGameParticipantService } from './custom-game-participant.service';
import { LobbyEventType } from '@/game/interfaces/lobby-event.interface';

@Injectable()
export class CustomGameService extends GameService {
  @Inject(ConfigService)
  private readonly config: CustomGameConfigService;

  protected readonly participant: CustomGameParticipantService;

  private _scenario: Scenario | null = null;

  get scenario(): Scenario | null {
    return this._scenario;
  }

  async selectScenario(id: string): Promise<boolean> {
    try {
      this._scenario = {
        id,
        ...(await this.backendApi.fetchScenarioContent(id)),
      };

      this.eventEmitter.emitLobbyEvent({
        type: LobbyEventType.SelectScenario,
        data: this._scenario,
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  lobby(): LobbyState {
    return {
      ownerId: this.config.ownerId,
      players: [...this.participant.players].map((x) => ({
        id: x.id,
        nickname: x.nickname,
        slot: x.slot,
      })),
      scenario: this.scenario
        ? {
            ...this._scenario,
            text: this._scenario.text.substring(0, 100),
          }
        : null,
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
