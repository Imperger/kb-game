import { ConfigService } from '@/game/config.service';
import { Injectable, OnModuleInit } from '@nestjs/common';

type PlayerId = string;

@Injectable()
export class QuickGameConfigService
  extends ConfigService
  implements OnModuleInit
{
  private _players: PlayerId[];

  private _scenarioId: string;

  onModuleInit() {
    super.onModuleInit();

    this._players = JSON.parse(process.env.PLAYERS);
    this._scenarioId = process.env.SCENARIO_ID;
  }

  get players() {
    return this._players;
  }

  get scenarioId() {
    return this._scenarioId;
  }
}
