import { Observable, Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { remoteCall } from '../remote-call';

import { Strategy, SwitchStrategy } from './strategy';

type Base64Image = string;

interface GameImageField {
  field: Base64Image;
}

enum GameEventType {
  PlayerProgress,
  EndGame
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

interface PlayerStats {
  id: PlayerId;
  accuracy: number;
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

type GameEvent = PlayersProgressEvent | EndGameEvent;

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

  private gameEventHandler = (e: GameEvent) => this.gameEvent(e);

  private readonly playersProgress = new Subject<PlayerProgress[]>();
  private readonly endGame = new Subject<GameSummary>();

  async activate (socket: Socket, switchStrategy: SwitchStrategy): Promise<void> {
    this.socket = socket;
    this.switchStrategy = switchStrategy;

    this.socket.on('game_event', this.gameEventHandler);

    this._fieldImg = (await this.fetchFieldImg()).field;
  }

  sendKey (key: string): Promise<PressKeyResult> {
    return remoteCall(this.socket, 'send_key', key);
  }

  get $playersProgress (): Observable<PlayerProgress[]> {
    return this.playersProgress;
  }

  get $endGame (): Observable<GameSummary> {
    return this.endGame;
  }

  get fieldImg (): Base64Image {
    return this._fieldImg;
  }

  set players (players: Player[]) {
    this._players = players;
  }

  get players (): Player[] {
    return this._players;
  }

  async deactivate (): Promise<void> {
    this.socket.off('game_event', this.gameEventHandler);
  }

  private gameEvent (e: GameEvent) {
    switch (e.type) {
      case GameEventType.PlayerProgress:
        this.playerProgressEvent(e.data as PlayerProgress[]);
        break;
      case GameEventType.EndGame:
        this.endGameEvent(e.data as GameSummary);
        break;
      default:
        throw new Error(`Unknown game event '${e}'`);
    }
  }

  private playerProgressEvent (e: PlayerProgress[]) {
    this.playersProgress.next(e);
  }

  private endGameEvent (summary: GameSummary): void {
    this.endGame.next(summary);
  }

  private async fetchFieldImg (): Promise<GameImageField> {
    return await remoteCall(this.socket, 'game_field');
  }
}
