import { ConfigService } from '@/game/config.service';
import { Injectable } from '@nestjs/common';

type PlayerId = string;

@Injectable()
export class QuickGameConfigService extends ConfigService {
  private _players: PlayerId[];

  private _scenarioId: string;

  constructor() {
    super();

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
