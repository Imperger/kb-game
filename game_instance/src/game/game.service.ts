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
import { BackendApiService, InputEvent } from './backend-api.service';
import { ParticipantService } from './participant.service';
import { EventEmitterService } from './event-emitter.service';
import { LobbyEventType } from './interfaces/lobby-event.interface';
import { GameEventType } from './interfaces/game-event.interface';
import { instanceUrl } from './instance-url';

type PlayerId = string;

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
export abstract class GameService {
  private _gameStarted = false;

  private scenarioText!: string;

  private scenarioImg!: Base64Image;

  private scenarioImgDescription!: PopulatedLine[];

  private endGameStrategy!: EndGameStrategy;

  private gameStartTime!: number;

  private _gameEnded = false;

  private winner: Player | null = null;

  private broadcastProgressTimer!: NodeJS.Timer;

  private playerProgress = new Map<PlayerId, ProgressTracker>();

  constructor(
    private readonly eventEmitter: EventEmitterService,
    protected readonly participant: ParticipantService,
    protected readonly backendApi: BackendApiService,
    private readonly shutdownService: ShutdownService,
  ) {}

  abstract get scenarioId(): string;

  async startGame(): Promise<boolean> {
    if (!this.scenarioId) return false;

    this._gameStarted = true;

    this.scenarioText = await this.backendApi.fetchScenarioText(
      this.scenarioId,
    );

    const gameFieldBuilder = new GameFieldBuilder();
    const gameFieldRenderer = new GameFieldRenderer();
    this.scenarioImgDescription = gameFieldBuilder.build(this.scenarioText);
    this.scenarioImg = await gameFieldRenderer.render(
      { text: this.scenarioText, description: this.scenarioImgDescription },
      { ...gameFieldBuilder.options, lineHeight: 50 },
    );

    this.gameStartTime = Date.now();
    this.participant.players.forEach((p) => this.attachProgressTracker(p));
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
    const gameDuration = Date.now() - this.gameStartTime;
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
            p.finished,
            gameDuration,
            5000,
          ),
        })),
      },
    });

    clearInterval(this.broadcastProgressTimer);

    this.participant.dispose();

    await this.backendApi.unlinkGameAll(instanceUrl());

    await this.backendApi.uploadReplay({
      duration: gameDuration,
      tracks: players.map((x) => ({
        finished: x.finished,
        playerId: x.id,
        data: x.progressTracker.replay as InputEvent[],
      })),
    });

    setTimeout(() => this.shutdownService.shutdown(), 10000);
  }

  attachProgressTracker(player: Player) {
    let progressTracker = this.playerProgress.get(player.id);

    if (!progressTracker) {
      progressTracker = new ProgressTracker(
        this.scenarioText,
        this.scenarioImgDescription,
        this.gameStartTime,
      );

      this.playerProgress.set(player.id, progressTracker);
    }

    player.progressTracker = progressTracker;
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
