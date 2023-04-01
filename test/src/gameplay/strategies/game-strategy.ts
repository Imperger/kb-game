import { Observable, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';

import { remoteCall } from '../remote-call';
import { Strategy, SwitchStrategy } from './strategy';

type Base64Image = string;

interface GameImageField {
  field: Base64Image;
}

enum GameEventType {
  PlayerProgress = 100,
  EndGame,
  SetTypingProgress
}

// Describes the player's typing progress
export interface PlayerProgress {
  id: string;
  progress: number; // [0-1]
}

interface PlayersProgressEvent {
  type: GameEventType.PlayerProgress;
  data: PlayerProgress[];
}

type PlayerId = string;

export interface PlayerStats {
  id: PlayerId;
  accuracy: number;
  avgCpm: number;
  cpm: number[]; // Each number describe cpm on 5 seconds interval
}

export interface GameSummary {
  winner: PlayerId;
  scores: PlayerStats[];
}

export interface EndGameEvent {
  type: GameEventType.EndGame;
  data: GameSummary;
}

export interface SetTypingProgress {
  width: number;
  line: number;
}

export interface SetTypingProgressEvent {
  type: GameEventType.SetTypingProgress;
  data: SetTypingProgress;
}

export type GameEvent =
  | PlayersProgressEvent
  | EndGameEvent
  | SetTypingProgressEvent;

const WrongChar = -1;
type WidthToThis = number;
type PressKeyResult = WidthToThis | typeof WrongChar;

export interface Player {
  id: string;
  nickname: string;
  slot: number;
  progress: number;
}

export class GameStrategy extends Strategy {
  private socket!: Socket;
  private switchStrategy!: (strategy: Strategy) => void;

  private _fieldImg!: Base64Image;

  private _players!: Player[];

  private readonly playersProgress = new Subject<PlayerProgress[]>();
  private readonly endGame = new Subject<GameSummary>();
  private readonly setTypingProgress = new Subject<SetTypingProgress>();

  private _cursorPosition: SetTypingProgress = { width: 0, line: 0 };

  async activate(
    socket: Socket,
    switchStrategy: SwitchStrategy
  ): Promise<void> {
    this.socket = socket;
    this.switchStrategy = switchStrategy;

    await super.activate(socket, switchStrategy);

    this._fieldImg = (await this.fetchFieldImg()).field;
  }

  sendKey(key: string): Promise<PressKeyResult> {
    return remoteCall(this.socket, 'send_key', key);
  }

  get $playersProgress(): Observable<PlayerProgress[]> {
    return this.playersProgress;
  }

  get $endGame(): Observable<GameSummary> {
    return this.endGame;
  }

  get $setTypingProgress(): Observable<SetTypingProgress> {
    return this.setTypingProgress;
  }

  get fieldImg(): Base64Image {
    return this._fieldImg;
  }

  set players(players: Player[]) {
    this._players = players;
  }

  get players(): Player[] {
    return this._players;
  }

  get cursorPosition(): SetTypingProgress {
    return this._cursorPosition;
  }

  async deactivate(): Promise<void> {
    await super.deactivate();
  }

  async onEvent(e: GameEvent): Promise<boolean> {
    switch (e.type) {
      case GameEventType.PlayerProgress:
        this.playerProgressEvent(e.data as PlayerProgress[]);
        return true;
      case GameEventType.EndGame:
        this.endGameEvent(e.data as GameSummary);
        return true;
      case GameEventType.SetTypingProgress:
        this.setTypingProgress.next(e.data);
        this._cursorPosition = e.data;
        return true;
      default:
        return false;
    }
  }

  private playerProgressEvent(e: PlayerProgress[]) {
    this.playersProgress.next(e);
  }

  private endGameEvent(summary: GameSummary): void {
    this.endGame.next(summary);
  }

  private async fetchFieldImg(): Promise<GameImageField> {
    return await remoteCall(this.socket, 'game_field');
  }
}
