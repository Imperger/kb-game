import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

import { GameFieldBuilder, PopulatedLine } from './game-field-builder';
import { GameFieldRenderer } from './game-field-renderer';
import { ProgressTracker, PressKeyResult, WrongChar } from './progress-tracker';
import { Player } from './Player';
import { EndGameStrategy } from './end-game/end-game-strategy';
import { replayMetrics } from './Replay';
import { WaitUntilProgressEndGame } from './end-game/wait-until-progress-end-game';
import { ShutdownService } from '../shutdown.service';
import { BackendApiService, Scenario } from './backend-api.service';
import { ParticipantService } from './participant.service';
import { EventEmitterService } from './event-emitter.service';
import { LobbyEventType } from './interfaces/lobby-event.interface';
import { GameEventType } from './interfaces/game-event.interface';
import { instanceUrl } from './instance-url';

export interface LobbyPlayer {
  id: string;
  nickname: string;
  slot: number;
}

export interface LobbyState {
  ownerId: string;
  players: LobbyPlayer[];
  scenarios: Scenario[];
}

type Nickname = string;
export interface ServerDescription {
  owner: Nickname;
  capacity: number;
  occupancy: number;
  started: boolean;
}

export interface GameState {
  field: {
    textImg: string; // base64
  };
}

export interface PlayerDesc {
  socket: Socket;
  id: string;
  nickname: string;
}

type Base64Image = string;

@Injectable()
export class GameService {
  private scenarios!: Scenario[];
  private _scenario: Scenario;

  private _gameStarted = false;

  private scenarioText!: string;

  private scenarioImg!: Base64Image;
  private scenarioImgDescription!: PopulatedLine[];

  private endGameStrategy!: EndGameStrategy;

  private gameStartTime!: number;

  private _gameEnded = false;

  private winner: Player | null = null;

  private broadcastProgressTimer!: NodeJS.Timer;

  constructor(
    private readonly eventEmitter: EventEmitterService,
    private readonly participant: ParticipantService,
    private readonly backendApi: BackendApiService,
    private readonly shutdownService: ShutdownService,
  ) {
    this.backendApi.listAllTitles().then((x) => {
      this.scenarios = x;
      this._scenario = this.scenarios[0];
    });
  }

  selectScenario(id: string): boolean {
    const seleted = this.scenarios.find((x) => x.id === id);

    if (seleted) {
      this._scenario = seleted;
    }

    return !!this.scenarios;
  }

  lobby(): LobbyState {
    return {
      ownerId: process.env.OWNER_ID,
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
      started: this._gameStarted,
    };
  }

  game(): GameState {
    return { field: { textImg: '' } };
  }

  async startGame(): Promise<boolean> {
    if (!this._scenario) return false;

    this._gameStarted = true;

    this.scenarioText = await this.backendApi.fetchScenarioText(
      this._scenario.id,
    );

    const gameFieldBuilder = new GameFieldBuilder();
    const gameFieldRenderer = new GameFieldRenderer();
    this.scenarioImgDescription = gameFieldBuilder.build(this.scenarioText);
    this.scenarioImg = await gameFieldRenderer.render(
      { text: this.scenarioText, description: this.scenarioImgDescription },
      { ...gameFieldBuilder.options, lineHeight: 50 },
    );

    this.gameStartTime = Date.now();
    this.participant.players.forEach(
      (p) =>
        (p.progressTracker = new ProgressTracker(
          this.scenarioText,
          this.scenarioImgDescription,
          this.gameStartTime,
        )),
    );

    this.eventEmitter.emitLobbyEvent({ type: LobbyEventType.GameWillStart });

    this.broadcastProgressTimer = setInterval(
      () => this.broadcastProgress(),
      500,
    );

    this.endGameStrategy = new WaitUntilProgressEndGame(10000);
    this.endGameStrategy.init(this.participant.players, () => this.endGame());

    return true;
  }

  pressKey(client: Socket, char: string): PressKeyResult {
    const player = this.participant.findBySocket(client);

    if (!player) throw new Error('Unknown player');

    const finished = player.finished;

    const ret = player.finished ? WrongChar : player.pressKey(char);

    if (player.finished && this.winner === null) {
      this.winner = player;
    }

    if (!player.finished || finished != player.finished)
      this.endGameStrategy.tick(player);

    return ret;
  }

  async endGame(): Promise<void> {
    this._gameEnded = true;

    const players = [...this.participant.players];

    this.eventEmitter.emitGameEvent({
      type: GameEventType.EndGame,
      data: {
        winner: this.winner.id,
        scores: players.map((p) => ({
          id: p.id,
          ...replayMetrics(
            p.progressTracker.replay,
            Date.now() - this.gameStartTime,
            5000,
          ),
        })),
      },
    });

    clearInterval(this.broadcastProgressTimer);

    this.participant.dispose();

    await this.backendApi.unlinkGameAll(instanceUrl());

    setTimeout(() => this.shutdownService.shutdown(), 10000);
  }

  get isStarted(): boolean {
    return this._gameStarted;
  }

  get gameFieldImage(): Base64Image {
    return this.scenarioImg;
  }

  get gameEnded(): boolean {
    return this._gameEnded;
  }

  private broadcastProgress() {
    this.eventEmitter.emitGameEvent({
      type: GameEventType.PlayerProgress,
      data: [...this.participant.players].map(({ id, progress }) => ({
        id,
        progress,
      })),
    });
  }
}
