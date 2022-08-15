import { Injectable, OnModuleInit } from '@nestjs/common';

export enum GameType {
  Unknown,
  Custom,
  Quick,
}

@Injectable()
export class ConfigService implements OnModuleInit {
  private _instanceId: string;

  private _backendApi: string;

  private _spawnerApi: string;

  private _spawnerSecret: string;

  private _gameType: GameType;

  onModuleInit() {
    this._instanceId = process.env.INSTANCE_ID;
    this._backendApi = process.env.BACKEND_API;
    this._spawnerApi = process.env.SPAWNER_API;
    this._spawnerSecret = process.env.SPAWNER_SECRET;

    switch (process.env.GAME_TYPE.toLowerCase()) {
      case 'custom':
        this._gameType = GameType.Custom;
      case 'quick':
        this._gameType = GameType.Quick;
      default:
        this._gameType = GameType.Unknown;
    }
  }

  get instanceId() {
    return this._instanceId;
  }

  get backendApi() {
    return this._backendApi;
  }

  get spawnerApi() {
    return this._spawnerApi;
  }

  get spawnerSecret() {
    return this._spawnerSecret;
  }

  get gameType(): GameType {
    return this._gameType;
  }
}
