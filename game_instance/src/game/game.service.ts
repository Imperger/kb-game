import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { sign } from 'jsonwebtoken';
import { firstValueFrom } from 'rxjs';
import { Server, Socket } from 'socket.io';

import { GameFieldBuilder, PopulatedLine } from './game-field-builder';
import { GameFieldRenderer } from './game-field-renderer';
import { ProgressTracker, PressKeyResult, WrongChar } from './progress-tracker';
import { Player } from './Player';
import { EndGameStrategy } from './end-game/end-game-strategy';
import { replayMetrics } from './Replay';
import { WaitUntilProgressEndGame } from './end-game/wait-until-progress-end-game';
import { ShutdownService } from '../shutdown.service';

export interface LobbyPlayer {
  id: string;
  nickname: string;
  slot: number;
}

interface Scenario {
  id: string;
  title: string;
}

interface ScenarioText {
  text: string;
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

enum LobbyEventType {
  PlayerJoined,
  PlayerLeaves,
  GameWillStart,
}

interface PlayerJoinedEvent {
  id: string;
  nickname: string;
  slot: number;
}

interface PlayerLeavesEvent {
  id: string;
}

type Base64Image = string;

interface LobbyEvent {
  type: LobbyEventType;
  data?: PlayerJoinedEvent | PlayerLeavesEvent;
}

/**
 * GAME LOGIC REGION
 */

enum GameEventType {
  PlayerProgress,
  EndGame,
}

// Describes the player's typing progress
interface PlayerProgress {
  id: string;
  progress: number; // [0-1]
}

interface PlayersProgressEvent {
  type: GameEventType.PlayerProgress;
  data: PlayerProgress[];
}

type PlayerId = string;

interface PlayerStats {
  id: PlayerId;
  accuracy: number;
  cpm: number[]; // Each number describe cpm on 5 seconds interval
}

interface GameSummary {
  winner: PlayerId;
  scores: PlayerStats[];
}

interface EndGameEvent {
  type: GameEventType.EndGame;
  data: GameSummary;
}

type GameEvent = PlayersProgressEvent | EndGameEvent;

@Injectable()
export class GameService {
  private roomCapacity = 10;

  private readonly players = new Map<Socket, Player>();

  private _server!: Server;
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
    private readonly http: HttpService,
    private readonly shutdownService: ShutdownService,
  ) {
    this.listAllTitles().then((x) => {
      this.scenarios = x;
      this._scenario = this.scenarios[0];
    });
  }

  newClient(client: Socket) {
    setTimeout(() => this.disconnectDangling(client), 1000);
  }

  disconnectClient(client: Socket) {
    const p = this.players.get(client);

    if (p) {
      this.emitLobbyEvent({
        type: LobbyEventType.PlayerLeaves,
        data: { id: p.id },
      });

      this.players.delete(client);
    }
  }

  addPlayer(player: PlayerDesc): boolean {
    if (
      this.players.size < this.roomCapacity &&
      ![...this.players.values()].find((x) => x.id === player.id)
    ) {
      const p = new Player(
        player.socket,
        player.id,
        player.nickname,
        this.findFreeSlot(),
      );

      this.players.set(player.socket, p);

      this.emitLobbyEvent({
        type: LobbyEventType.PlayerJoined,
        data: { id: player.id, nickname: player.nickname, slot: p.slot },
      });

      return true;
    } else {
      setImmediate(() => player.socket.disconnect());

      return false;
    }
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
      players: [...this.players.values()].map((x) => ({
        id: x.id,
        nickname: x.nickname,
        slot: x.slot,
      })),
      scenarios: this.scenarios,
    };
  }

  serverDescription(): ServerDescription {
    const owner =
      [...this.players.values()].find((p) => p.id === process.env.OWNER_ID)
        ?.nickname ?? 'Unknown';

    return {
      owner,
      capacity: 10,
      occupancy: this.players.size,
      started: this._gameStarted,
    };
  }

  game(): GameState {
    return { field: { textImg: '' } };
  }

  async listAllTitles(): Promise<Scenario[]> {
    return (
      await firstValueFrom(
        this.http.get(
          `${process.env.BACKEND_API}/api/scenario/list_all_titles`,
          this.useAuthorization(),
        ),
      )
    ).data;
  }

  async fetchScenarioText(): Promise<string> {
    return (
      await firstValueFrom(
        this.http.get<ScenarioText>(
          `${process.env.BACKEND_API}/api/scenario/text/${this._scenario.id}`,
          this.useAuthorization(),
        ),
      )
    ).data.text;
  }

  async startGame(): Promise<boolean> {
    if (!this._scenario) return false;

    this._gameStarted = true;

    this.scenarioText = await this.fetchScenarioText();

    const gameFieldBuilder = new GameFieldBuilder();
    const gameFieldRenderer = new GameFieldRenderer();
    this.scenarioImgDescription = gameFieldBuilder.build(this.scenarioText);
    this.scenarioImg = await gameFieldRenderer.render(
      { text: this.scenarioText, description: this.scenarioImgDescription },
      { ...gameFieldBuilder.options, lineHeight: 50 },
    );

    this.gameStartTime = Date.now();
    this.players.forEach(
      (p) =>
        (p.progressTracker = new ProgressTracker(
          this.scenarioText,
          this.scenarioImgDescription,
          this.gameStartTime,
        )),
    );

    this.emitLobbyEvent({ type: LobbyEventType.GameWillStart });

    this.broadcastProgressTimer = setInterval(
      () => this.broadcastProgress(),
      500,
    );

    this.endGameStrategy = new WaitUntilProgressEndGame(10000);
    this.endGameStrategy.init(this.players, () => this.endGame());

    return true;
  }

  pressKey(client: Socket, char: string): PressKeyResult {
    const player = this.players.get(client);

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

  endGame(): void {
    this._gameEnded = true;

    const players = [...this.players.values()];

    this.emitGameEvent({
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

    this.players.forEach((p, s) => !s.disconnected && s.disconnect());
    this.players.clear();

    setTimeout(() => this.shutdownService.shutdown(), 10000);
  }

  get gameFieldImage(): Base64Image {
    return this.scenarioImg;
  }

  set server(server: Server) {
    this._server = server;
  }

  get gameEnded(): boolean {
    return this._gameEnded;
  }

  private broadcastProgress() {
    this.emitGameEvent({
      type: GameEventType.PlayerProgress,
      data: [...this.players.values()].map(({ id, progress }) => ({
        id,
        progress,
      })),
    });
  }

  private useAuthorization() {
    const token = sign(
      { spawner: process.env.SPAWNER_API.toLowerCase() },
      process.env.SPAWNER_SECRET,
      { expiresIn: '3m' },
    );

    return { headers: { Authorization: `Bearer ${token}` } };
  }

  private emitLobbyEvent(e: LobbyEvent): void {
    this._server.emit('lobby_event', e);
  }

  private emitGameEvent(e: GameEvent): void {
    this._server.emit('game_event', e);
  }

  private disconnectDangling(client: Socket) {
    if (!(this.players.has(client) || client.disconnected)) {
      client.disconnect();
    }
  }

  private findFreeSlot(): number {
    const slotPool = new Set([...Array(10).keys()]);

    [...this.players.values()].forEach((x) => slotPool.delete(x.slot));

    return [...slotPool][0];
  }
}
